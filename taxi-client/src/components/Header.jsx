import { Navbar, Nav, NavItem } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLang } from "./LangContext";

import { logout as userLogout } from "../slices/userSlice";
import { logout as driverLogout } from "../slices/driverSlice";
import { logout as adminLogout } from "../slices/adminSlice";

import logoImg from "../images/logo2.png";
import homePic from "../images/house.png";
import searchIcon from "../images/search.png";
import aboutIcon from "../images/team.png";
import chatIcon from "../images/chat.png";
import bookingIcon from "../images/booking.png";
import feedbackIcon from "../images/good-feedback.png";
import profileIcon from "../images/user (1).png";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isUserLoggedIn   = useSelector((state) => state.user.isLoggedIn);
  const isDriverLoggedIn = useSelector((state) => state.driver.isLoggedIn);
  const isAdminLoggedIn  = useSelector((state) => state.admin.isLoggedIn);
  const currentUser   = useSelector((state) => state.user.user);
  const currentDriver = useSelector((state) => state.driver.driver);

  const isLoggedIn = isUserLoggedIn || isDriverLoggedIn || isAdminLoggedIn;

  const notifEmail =
    isUserLoggedIn   ? currentUser?.userEmail    :
    isDriverLoggedIn ? currentDriver?.driverEmail : null;

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!notifEmail) { setUnreadCount(0); return; }
    try {
      const res  = await fetch(`http://localhost:7500/notifications/${encodeURIComponent(notifEmail)}`);
      const data = await res.json();
      setUnreadCount((data.notifications || []).filter((n) => !n.isRead).length);
    } catch { /* silent */ }
  }, [notifEmail]);

  useEffect(() => {
    if (!notifEmail) return;
    fetchUnread();
    const timer = setInterval(fetchUnread, 1000);
    return () => clearInterval(timer);
  }, [notifEmail, fetchUnread]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // ---------- THEME ----------
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const isDark = theme === "dark";

  // every color the header uses, in one place
  const c = {
    navBg:       isDark ? "#1f1b2e" : "#c7b6ee",
    text:        isDark ? "#e8d9ff" : "#4b0082",
    textMuted:   isDark ? "#bda9d6" : "#4b0082",
    accent:      isDark ? "#b388ff" : "#4b0082",
    dropdownBg:  isDark ? "#2a223d" : "#e9d1ef",
    dropdownText:isDark ? "#f0e6ff" : "#222",
    divider:     isDark ? "#3d3357" : "#d6b8dd",
    danger:      isDark ? "#ff7676" : "#8b1313",
    btnPrimaryBg:isDark ? "#7c4dff" : "#4b0082",
    btnPrimaryTx:"#fff",
    btnOutlineTx:isDark ? "#e8d9ff" : "#4b0082",
    btnOutlineBd:isDark ? "#e8d9ff" : "#4b0082",
  };
  // ---------------------------

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(userLogout());
    dispatch(driverLogout());
    dispatch(adminLogout());
    localStorage.removeItem("userToken");
    localStorage.removeItem("driverToken");
    localStorage.removeItem("adminToken");
    setIsProfileOpen(false);
    navigate("/");
  };

  const { lang, t, toggleLang } = useLang();

  const displayName = currentUser?.userName || currentDriver?.driverName || "Account";

  const linkStyle = { color: c.text, gap: "6px" };

  return (
    <Navbar
      expand="lg"
      className="px-4 shadow-sm"
      style={{ backgroundColor: c.navBg, height: "80px" }}
    >
      <Link to="/" className="d-flex align-items-center">
        <img
          src={logoImg}
          alt="Travel Buddy Logo"
          style={{ height: "60px", width: "60px", cursor: "pointer" }}
        />
      </Link>

      <Nav
        navbar
        className="mx-auto d-flex align-items-center"
        style={{ gap: "35px", fontSize: "1.1rem", fontWeight: 500 }}
      >
        <NavItem>
          <Link to="/about" className="nav-link d-flex align-items-center" style={linkStyle}>
            <img src={aboutIcon} alt="About" style={{ height: "26px" }} />
            {t("about")}
          </Link>
        </NavItem>

        {isLoggedIn && (
          <>
            <NavItem>
              <Link to="/home" className="nav-link d-flex align-items-center" style={linkStyle}>
                <img src={homePic} alt="Home" style={{ height: "26px" }} />
                {t("home")}
              </Link>
            </NavItem>

            {isDriverLoggedIn && (
              <NavItem>
                <Link
                  to="/driver-dashboard"
                  className="nav-link d-flex align-items-center"
                  style={{ ...linkStyle, fontWeight: 700 }}
                >
                  🚗 {t("dashboard")}
                </Link>
              </NavItem>
            )}

            {!isDriverLoggedIn && !isAdminLoggedIn && (
              <>
                <NavItem>
                  <Link to="/search" className="nav-link d-flex align-items-center" style={linkStyle}>
                    <img src={searchIcon} alt="Search" style={{ height: "26px" }} />
                    {t("search")}
                  </Link>
                </NavItem>

                <NavItem>
                  <Link to="/booking" className="nav-link d-flex align-items-center" style={linkStyle}>
                    <img src={bookingIcon} alt="Booking" style={{ height: "26px" }} />
                    {t("booking")}
                  </Link>
                </NavItem>

                <NavItem>
                  <Link to="/chat" className="nav-link d-flex align-items-center" style={linkStyle}>
                    <img src={chatIcon} alt="Chat" style={{ height: "26px" }} />
                    {t("chat")}
                  </Link>
                </NavItem>

                <NavItem>
                  <Link to="/feedback" className="nav-link d-flex align-items-center" style={linkStyle}>
                    <img src={feedbackIcon} alt="Feedback" style={{ height: "26px" }} />
                    {t("feedback")}
                  </Link>
                </NavItem>

                <NavItem>
                  <Link to="/my-bookings" className="nav-link d-flex align-items-center" style={linkStyle}>
                    📋 {t("myBookings")}
                  </Link>
                </NavItem>
              </>
            )}

            {isAdminLoggedIn && (
              <NavItem>
                <Link to="/admin" className="nav-link d-flex align-items-center" style={linkStyle}>
                  <img src={chatIcon} alt="Admin" style={{ height: "26px" }} />
                  Admin
                </Link>
              </NavItem>
            )}
          </>
        )}
      </Nav>

      <Nav navbar className="d-flex align-items-center" style={{ gap: "12px" }}>
        {isLoggedIn && !isAdminLoggedIn && (
          <NavItem>
            <Link
              to="/notifications"
              style={{ position: "relative", display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              title="Notifications"
            >
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  backgroundColor: "#e74c3c", color: "white",
                  borderRadius: "50%", fontSize: "0.65rem", fontWeight: 700,
                  minWidth: 18, height: 18, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  padding: "0 3px", lineHeight: 1,
                }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          </NavItem>
        )}

        {!isLoggedIn ? (
          <>
            <NavItem>
              <Link
                to="/login"
                style={{
                  backgroundColor: c.btnPrimaryBg,
                  color: c.btnPrimaryTx,
                  padding: "8px 22px",
                  borderRadius: "20px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                {t("login")}
              </Link>
            </NavItem>
            <NavItem>
              <Link
                to="/user-type"
                style={{
                  backgroundColor: "transparent",
                  color: c.btnOutlineTx,
                  padding: "8px 22px",
                  borderRadius: "20px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  border: `2px solid ${c.btnOutlineBd}`,
                }}
              >
                {t("register")}
              </Link>
            </NavItem>
          </>
        ) : (
          <NavItem>
            <div ref={profileRef} style={{ position: "relative" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                onClick={() => setIsProfileOpen((o) => !o)}
              >
                <img src={profileIcon} alt="User" style={{ width: "40px" }} />
                <span style={{ fontWeight: 600, color: c.text, fontSize: "0.95rem" }}>
                  {displayName}
                </span>
                <span style={{ fontSize: "1.4rem", color: c.text }}>
                  {isProfileOpen ? "˄" : "˅"}
                </span>
              </div>

              {isProfileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: 0,
                    width: "220px",
                    backgroundColor: c.dropdownBg,
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    padding: "10px 0",
                    zIndex: 999,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: c.dropdownText,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={toggleTheme}
                  >
                    <span>{theme === "light" ? t("darkMode") : t("lightMode")}</span>
                    <span>{theme === "light" ? "🌙" : "☀"}</span>
                  </div>

                  <div style={{ height: "1px", backgroundColor: c.divider }} />

                  <div
                    style={{
                      padding: "12px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: c.dropdownText,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={toggleLang}
                  >
                    <span>{lang === "en" ? "العربية" : "English"}</span>
                    <span>{lang === "en" ? "🌍" : "🌐"}</span>
                  </div>

                  <div style={{ height: "1px", backgroundColor: c.divider }} />

                  <div
                    style={{
                      padding: "12px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: c.accent,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={() => { setIsProfileOpen(false); navigate("/change-password"); }}
                  >
                    <span>{t("changePassword")}</span>
                    <span>🔑</span>
                  </div>

                  <div style={{ height: "1px", backgroundColor: c.divider }} />

                  <div
                    style={{
                      padding: "12px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: c.danger,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={handleLogout}
                  >
                    <span>{t("logout")}</span>
                    <span>›</span>
                  </div>
                </div>
              )}
            </div>
          </NavItem>
        )}
      </Nav>
    </Navbar>
  );
}