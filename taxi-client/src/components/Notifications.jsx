import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLang } from "./LangContext";

const SERVER = "http://localhost:7500";

function useTheme() {
  const [theme, setTheme] = useState(
    () => (typeof document !== "undefined" && document.body.className) || "light"
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.className || "light");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60)    return `${secs}s ago`;
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function Notifications() {
  const navigate = useNavigate();
  const { t } = useLang();
  const currentUser      = useSelector((s) => s.user.user);
  const isUserLoggedIn   = useSelector((s) => s.user.isLoggedIn);
  const currentDriver    = useSelector((s) => s.driver.driver);
  const isDriverLoggedIn = useSelector((s) => s.driver.isLoggedIn);

  const [notifications, setNotifications] = useState([]);
  const [clearing, setClearing] = useState(false);

  const theme = useTheme();
  const isDark = theme === "dark";
  const c = {
    pageBg:        isDark ? "#15111f" : "#f9f3ff",
    cardBg:        isDark ? "#1f1b2e" : "#ffffff",
    unreadBg:      isDark ? "#2a2150" : "#f0e8ff",
    title:         isDark ? "#e8d9ff" : "#4b0082",
    text:          isDark ? "#f0e6ff" : "#222",
    textBody:      isDark ? "#d1c4f0" : "#555",
    textMuted:     isDark ? "#9b8fb8" : "#888",
    textFaded:     isDark ? "#6b6485" : "#999",
    border:        isDark ? "#3d3357" : "#eee",
    borderUnreadFallback: isDark ? "#5a4485" : "#ddd",
    accentBtn:     isDark ? "#b388ff" : "#6E2F8A",
    clearBtnBg:    isDark ? "#3d3357" : "#ccc",
    clearBtnTx:    isDark ? "#f0e6ff" : "#333",
    shadow:        isDark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.07)",
    shadowUnread:  isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.07)",
  };

  const TYPE_META = {
    message:           { icon: "💬", accent: isDark ? "#b388ff" : "#4b0082" },
    booking_accepted:  { icon: "🚗", accent: "#27ae60" },
    booking_complete:  { icon: "✅", accent: isDark ? "#64b5f6" : "#2980b9" },
    account_removed:   { icon: "🚫", accent: "#c0392b" },
    driver_approved:   { icon: "✅", accent: "#27ae60" },
    driver_rejected:   { icon: "❌", accent: "#c0392b" },
    driver_suspended:  { icon: "⚠️", accent: "#e67e22" },
    driver_reinstated: { icon: "✅", accent: "#27ae60" },
    payment_confirmed: { icon: "💳", accent: isDark ? "#64b5f6" : "#1565c0" },
    admin_message:     { icon: "📢", accent: isDark ? "#b388ff" : "#6a1b9a" },
  };

  const email = isUserLoggedIn ? currentUser?.userEmail : isDriverLoggedIn ? currentDriver?.driverEmail : null;

  const fetchNotifications = useCallback(async () => {
    if (!email) return;
    try {
      const res  = await fetch(`${SERVER}/notifications/${encodeURIComponent(email)}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch { }
  }, [email]);

  const markRead = async (id) => {
    try {
      await fetch(`${SERVER}/notifications/read/${id}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch { }
  };

  const markAllRead = async () => {
    if (!email) return;
    try {
      await fetch(`${SERVER}/notifications/read-all/${encodeURIComponent(email)}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { }
  };

  const clearAll = async () => {
    if (!email) return;
    setClearing(true);
    try {
      await fetch(`${SERVER}/notifications/clear/${encodeURIComponent(email)}`, { method: "DELETE" });
      setNotifications([]);
    } catch { }
    setClearing(false);
  };

  useEffect(() => {
    if (!isUserLoggedIn && !isDriverLoggedIn) { navigate("/login"); return; }
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 1000);
    return () => clearInterval(timer);
  }, [isUserLoggedIn, isDriverLoggedIn, fetchNotifications, navigate]);

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ minHeight: "calc(100vh - 82px)", backgroundColor: c.pageBg, padding: "32px 20px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
          <h1 style={{ color: c.title, fontWeight: 700, fontSize: "1.9rem", margin: 0 }}>
            {t("notificationsTitle")}
            {unread > 0 && (
              <span style={{ marginLeft: 10, backgroundColor: "#e74c3c", color: "white", borderRadius: "50%", fontSize: "0.85rem", fontWeight: 700, padding: "2px 8px", verticalAlign: "middle" }}>
                {unread}
              </span>
            )}
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ backgroundColor: c.accentBtn, color: "white", border: "none", borderRadius: 20, padding: "7px 18px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
                {t("markAllRead")}
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} disabled={clearing} style={{ backgroundColor: c.clearBtnBg, color: c.clearBtnTx, border: "none", borderRadius: 20, padding: "7px 18px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
                {clearing ? t("clearing") : t("clearAll")}
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: c.cardBg, borderRadius: 16, boxShadow: c.shadow, border: `1px solid ${c.border}` }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔕</div>
            <p style={{ color: c.textMuted, fontSize: "1.05rem" }}>{t("noNotificationsYet")}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] || { icon: "🔔", accent: isDark ? "#9b8fb8" : "#555" };
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  backgroundColor: n.isRead ? c.cardBg : c.unreadBg,
                  border: `1px solid ${n.isRead ? c.border : meta.accent + "66"}`,
                  borderLeft: `5px solid ${n.isRead ? c.borderUnreadFallback : meta.accent}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow: n.isRead ? "none" : c.shadowUnread,
                  cursor: n.isRead ? "default" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.97rem", color: c.text }}>
                      {n.title}
                      {!n.isRead && (
                        <span style={{ marginLeft: 8, backgroundColor: meta.accent, color: "white", borderRadius: 10, fontSize: "0.65rem", padding: "2px 7px", verticalAlign: "middle", fontWeight: 700 }}>NEW</span>
                      )}
                    </p>
                    <span style={{ fontSize: "0.78rem", color: c.textFaded, whiteSpace: "nowrap" }}>{timeAgo(n.createdAt)}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: c.textBody, wordBreak: "break-word" }}>{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}