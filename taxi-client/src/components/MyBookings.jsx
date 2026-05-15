import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLang } from "./LangContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

export default function MyBookings() {
  const navigate = useNavigate();
  const { t } = useLang();
  const currentUser = useSelector((state) => state.user.user);
  const isLoggedIn  = useSelector((state) => state.user.isLoggedIn);

  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [completeMsg, setCompleteMsg] = useState({});
  const [completing, setCompleting] = useState({});
  const [trackingId, setTrackingId] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [paidBookings, setPaidBookings] = useState({});

  const theme = useTheme();
  const isDark = theme === "dark";
  const c = {
    pageBg:        isDark ? "#15111f" : "#f9f3ff",
    cardBg:        isDark ? "#1f1b2e" : "#ffffff",
    driverBoxBg:   isDark ? "#1c2e1c" : "#f0faf0",
    title:         isDark ? "#e8d9ff" : "#4b0082",
    text:          isDark ? "#f0e6ff" : "#222",
    textBody:      isDark ? "#d1c4f0" : "#444",
    textMuted:     isDark ? "#9b8fb8" : "#666",
    textFaded:     isDark ? "#6b6485" : "#888",
    textVeryFaded: isDark ? "#5a5475" : "#aaa",
    accent:        isDark ? "#b388ff" : "#6E2F8A",
    border:        isDark ? "#3d3357" : "transparent",
    shadow:        isDark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)",
    shadowSm:      isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.1)",
  };

  const STATUS_COLORS = isDark
    ? { pending: "#9b8fb8", confirmed: "#ffb74d", driver_ready: "#64b5f6",
        driver_accepted: "#ff9800", completed: "#b388ff", paid: "#66bb6a" }
    : { pending: "#888", confirmed: "#e67e22", driver_ready: "#2980b9",
        driver_accepted: "#e65100", completed: "#6E2F8A", paid: "#27ae60" };

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    fetchBookings();
  }, [isLoggedIn]);

  const fetchBookings = async () => {
    try {
      const email = currentUser?.userEmail;
      if (!email) return;
      const res = await fetch(`${SERVER}/bookings/user/${encodeURIComponent(email)}`);
      const data = await res.json();
      const list = data.bookings || [];
      setBookings(list);
      const pendingRes = await fetch(`${SERVER}/bookings/pending-payment/${encodeURIComponent(email)}`);
      const pendingData = await pendingRes.json();
      const pendingIds = new Set((pendingData.bookings || []).map((b) => b._id));
      const paidMap = {};
      list.forEach((b) => {
        if (b.status === "driver_accepted") paidMap[b._id] = !pendingIds.has(b._id);
      });
      setPaidBookings(paidMap);
    } catch (err) {
      console.error("fetchBookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (bookingId) => {
    setCompleting((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch(`${SERVER}/bookings/${bookingId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.flag) {
        setCompleteMsg((prev) => ({ ...prev, [bookingId]: "✅ Marked as complete!" }));
        fetchBookings();
      } else {
        setCompleteMsg((prev) => ({ ...prev, [bookingId]: data.serverMsg || "Could not complete" }));
      }
    } catch {
      setCompleteMsg((prev) => ({ ...prev, [bookingId]: "Server error" }));
    }
    setCompleting((prev) => ({ ...prev, [bookingId]: false }));
  };

  const handleTrack = async (driverId, bookingId) => {
    if (trackingId === bookingId) {
      setTrackingId(null);
      setDriverLocation(null);
      return;
    }
    setTrackingId(bookingId);
    setLocationLoading(true);
    try {
      const res = await fetch(`${SERVER}/driver/location/${driverId}`);
      const data = await res.json();
      if (data.flag && data.lat && data.lng) {
        setDriverLocation({ lat: data.lat, lng: data.lng, name: data.name });
      } else {
        setDriverLocation(null);
      }
    } catch (_) {
      setDriverLocation(null);
    }
    setLocationLoading(false);
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 82px)", backgroundColor: c.pageBg, padding: "32px 20px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: c.title, fontWeight: 700, fontSize: "2rem", marginBottom: 28, textAlign: "center" }}>
          {t("myBookingsTitle")}
        </h1>

        {loading && <p style={{ textAlign: "center", color: c.textFaded }}>{t("loadingBookings")}</p>}

        {!loading && bookings.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            backgroundColor: c.cardBg, borderRadius: 16,
            boxShadow: c.shadow,
            border: `1px solid ${c.border}`,
          }}>
            <p style={{ fontSize: "1.1rem", color: c.textMuted }}>{t("noBookingsYet")}</p>
            <button
              onClick={() => navigate("/search")}
              style={{ marginTop: 16, backgroundColor: c.accent, color: "white", border: "none", borderRadius: 24, padding: "10px 28px", fontSize: "1rem", cursor: "pointer" }}
            >
              {t("findATrip")}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {bookings.map((b) => {
            const trip = b.tripId;
            const statusKey = { pending: "statusPending", confirmed: "statusConfirmed", driver_ready: "statusDriverReady", driver_accepted: "statusDriverAccepted", completed: "statusCompleted", paid: "statusPaid" }[b.status];
            const statusInfo = { text: statusKey ? t(statusKey) : b.status, color: STATUS_COLORS[b.status] || (isDark ? "#9b8fb8" : "#555") };
            const isCompleted = b.status === "completed";
            const needsPayment = b.status === "driver_accepted" && !paidBookings[b._id];
            const canComplete = b.status === "driver_accepted" && !needsPayment;
            const hasDriver = !!b.driverId;
            const isTracking = trackingId === b._id;

            return (
              <div
                key={b._id}
                style={{
                  backgroundColor: c.cardBg,
                  borderRadius: 16,
                  padding: "22px 26px",
                  boxShadow: c.shadow,
                  borderLeft: `5px solid ${statusInfo.color}`,
                  border: `1px solid ${c.border}`,
                  borderLeftWidth: 5,
                  borderLeftStyle: "solid",
                  borderLeftColor: statusInfo.color,
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <span style={{ backgroundColor: statusInfo.color, color: "white", borderRadius: 20, padding: "4px 14px", fontSize: "0.8rem", fontWeight: 600 }}>
                    {statusInfo.text}
                  </span>
                </div>

                {trip ? (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ margin: "4px 0", fontWeight: 600, fontSize: "1.05rem", color: c.text }}>
                      {trip.fromLocation} → {trip.toLocation}
                    </p>
                    <p style={{ margin: "2px 0", color: c.textMuted, fontSize: "0.9rem" }}>
                      📅 {trip.travelDate ? new Date(trip.travelDate).toLocaleDateString() : "–"}
                      {trip.travelTime ? `  ⏰ ${trip.travelTime}` : ""}
                    </p>
                  </div>
                ) : (
                  <p style={{ color: c.textVeryFaded, fontSize: "0.9rem", marginBottom: 10 }}>{t("tripDetailsUnavailable")}</p>
                )}

                <div style={{ marginBottom: 10 }}>
                  <p style={{ margin: "4px 0", fontSize: "0.9rem", color: c.textBody }}>
                    <b>👥 {t("participants")}:</b> {b.participantEmails?.length > 0 ? b.participantEmails.join(", ") : "—"}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "0.9rem", color: c.textBody }}>
                    <b>💰 {t("totalFare")}:</b> OMR {b.totalFare ? Number(b.totalFare).toFixed(3) : "—"}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "0.9rem", color: c.textBody }}>
                    <b>💰 {t("farePerPerson")}:</b> OMR {b.farePerPerson ? Number(b.farePerPerson).toFixed(3) : "—"}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "0.9rem", color: c.textBody }}>
                    <b>📋 {t("bookingId")}:</b> {b._id}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "0.9rem", color: c.textBody }}>
                    <b>📅 {t("bookedOn")}:</b> {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {b.driverName && (
                  <div style={{ backgroundColor: c.driverBoxBg, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: "0.9rem", color: c.text }}>
                    <p style={{ margin: "2px 0" }}><b>🚗 {t("driver")}:</b> {b.driverName}</p>
                    <p style={{ margin: "2px 0" }}><b>🚙 {t("vehicle")}:</b> {b.vehicleModel}</p>
                    <p style={{ margin: "2px 0" }}><b>🔢 {t("plate")}:</b> {b.plateNumber}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {needsPayment && (
                    <button
                      onClick={() => navigate("/payment-method", {
                        state: { fare: b.farePerPerson, bookingId: b._id },
                      })}
                      style={{
                        backgroundColor: "#e65100", color: "white", border: "none",
                        borderRadius: 24, padding: "9px 24px", fontWeight: 700,
                        fontSize: "0.95rem", cursor: "pointer",
                      }}
                    >
                      {t("payYourShare")} — OMR {b.farePerPerson ? Number(b.farePerPerson).toFixed(3) : "0.000"}
                    </button>
                  )}

                  {canComplete && (
                    <button
                      onClick={() => handleMarkComplete(b._id)}
                      disabled={completing[b._id]}
                      style={{
                        backgroundColor: completing[b._id] ? (isDark ? "#5a5475" : "#aaa") : "#27ae60",
                        color: "white", border: "none", borderRadius: 24, padding: "9px 24px",
                        fontWeight: 600, fontSize: "0.95rem",
                        cursor: completing[b._id] ? "not-allowed" : "pointer",
                      }}
                    >
                      {completing[b._id] ? t("marking") : t("markAsComplete")}
                    </button>
                  )}

                  {canComplete && hasDriver && (
                    <button
                      onClick={() => handleTrack(b.driverId, b._id)}
                      style={{
                        backgroundColor: isTracking ? "#e53935" : "#1976d2",
                        color: "white", border: "none", borderRadius: 24, padding: "9px 24px",
                        fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
                      }}
                    >
                      {isTracking ? t("stopTracking") : t("trackDriver")}
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => navigate("/feedback")}
                      style={{
                        backgroundColor: c.accent, color: "white", border: "none",
                        borderRadius: 24, padding: "9px 24px", fontWeight: 600,
                        fontSize: "0.95rem", cursor: "pointer",
                      }}
                    >
                      {t("leaveFeedbackBtn")}
                    </button>
                  )}

                  {completeMsg[b._id] && (
                    <span style={{ fontSize: "0.9rem", color: c.textMuted }}>{completeMsg[b._id]}</span>
                  )}
                </div>

                {isTracking && (
                  <div style={{ marginTop: 16 }}>
                    {locationLoading ? (
                      <p style={{ color: c.textFaded, fontSize: "0.9rem" }}>{t("fetchingLocation")}</p>
                    ) : driverLocation ? (
                      <div style={{ borderRadius: 12, overflow: "hidden", height: 240, boxShadow: c.shadowSm }}>
                        <MapContainer center={[driverLocation.lat, driverLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                          />
                          <Marker position={[driverLocation.lat, driverLocation.lng]}>
                            <Popup>🚗 {driverLocation.name || "Driver"}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    ) : (
                      <p style={{ color: "#e53935", fontSize: "0.9rem" }}>{t("driverLocationNA")}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}