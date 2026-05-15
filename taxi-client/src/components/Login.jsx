import { Container, Row, Col, FormGroup } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLang } from "./LangContext";
import { loginThunk } from "../slices/userSlice";
import { driverLoginThunk } from "../slices/driverSlice";
import { adminLoginThunk } from "../slices/adminSlice";

const TYPES = ["user", "driver", "admin"];

export default function Login() {
  const [userType, setUserType] = useState("user");
  const [email, setEmail]       = useState("");
  const [pwd, setPwd]           = useState("");
  const [msg, setMsg]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLang();

  const isUserLoggedIn   = useSelector((s) => s.user.isLoggedIn);
  const isDriverLoggedIn = useSelector((s) => s.driver.isLoggedIn);
  const isAdminLoggedIn  = useSelector((s) => s.admin.isLoggedIn);

  useEffect(() => {
    if (isUserLoggedIn)   navigate("/home");
    if (isDriverLoggedIn) navigate("/driver-dashboard");
    if (isAdminLoggedIn)  navigate("/admin");
  }, [isUserLoggedIn, isDriverLoggedIn, isAdminLoggedIn, navigate]);

  const TYPE_COLORS = { user: "#4b0082", driver: "#8b2c2c", admin: "#1a5276" };
  const accentColor = TYPE_COLORS[userType];

  const TYPE_LABELS = { user: `👤 ${t("user")}`, driver: `🚗 ${t("taxiDriver")}`, admin: `🛡️ ${t("admin")}` };

  const forgotLink =
    userType === "driver" ? "/driver-forgot-password" :
    userType === "admin"  ? null :
    "/forgotPassword";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email.trim() || !pwd.trim()) { setMsg(t("fillAllFields")); return; }
    setLoading(true);
    try {
      if (userType === "user") {
        const res = await dispatch(loginThunk({ email, pwd }));
        const p = res?.payload;
       if (!p?.loginStatus) {
  setMsg(p?.serverMsg || p?.msg || t("wrongCredentials"));
}
      } else if (userType === "driver") {
        const res = await dispatch(driverLoginThunk({ driverEmail: email, driverPassword: pwd }));
        const p = res?.payload;
        if (!p?.flag) setMsg(p?.serverMsg || t("wrongCredentials"));
      } else {
        const res = await dispatch(adminLoginThunk({ adminEmail: email, adminPassword: pwd }));
        const p = res?.payload;
        if (!p?.flag) setMsg(p?.msg || p?.serverMsg || t("wrongCredentials"));
      }
    } catch {
      setMsg(t("wrongCredentials"));
    }
    setLoading(false);
  };

  return (
    <Container fluid className="d-flex justify-content-center" style={{ minHeight: "calc(100vh - 82px)", alignItems: "center" }}>
      <Container style={{ maxWidth: 480, paddingTop: 32, paddingBottom: 40 }}>
        <Row className="mb-4">
          <Col className="text-center">
            <h1 style={{ color: accentColor, fontWeight: "bold", fontSize: "2.3rem", transition: "color 0.3s" }}>
              {t("loginTitle")}
            </h1>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col className="d-flex justify-content-center">
            <div style={{ display: "inline-flex", borderRadius: 40, overflow: "hidden" }}>
              <button type="button" style={{ border: "none", padding: "10px 30px", backgroundColor: accentColor, color: "#fff", fontSize: "1.05rem", fontWeight: "bold", cursor: "default", transition: "background-color 0.3s" }}>
                {t("login")}
              </button>
              <button type="button" onClick={() => navigate("/user-type")} style={{ border: "none", padding: "10px 30px", backgroundColor: "#c0b4ff", color: "#fff", fontSize: "1.05rem", fontWeight: "bold", cursor: "pointer" }}>
                {t("signUp")}
              </button>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col className="d-flex justify-content-center">
            <div style={{ display: "inline-flex", backgroundColor: "#f0e8ff", borderRadius: 40, padding: "4px", gap: 4 }}>
              {TYPES.map((id) => (
                <label key={id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 36, cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", backgroundColor: userType === id ? TYPE_COLORS[id] : "transparent", color: userType === id ? "#fff" : "#555", transition: "all 0.2s", userSelect: "none" }}>
                  <input type="radio" name="userType" value={id} checked={userType === id} onChange={() => { setUserType(id); setMsg(""); }} style={{ display: "none" }} />
                  {TYPE_LABELS[id]}
                </label>
              ))}
            </div>
          </Col>
        </Row>

        <form onSubmit={handleSubmit}>
          <FormGroup className="mb-3">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: 20, padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: 10 }}>👤</span>
                <input type="email" className="form-control border-0" style={{ backgroundColor: "transparent", boxShadow: "none" }} placeholder={t("emailAddress")} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </FormGroup>

          <FormGroup className="mb-2">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: 20, padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: 10 }}>🔒</span>
                <input type={showPwd ? "text" : "password"} className="form-control border-0" style={{ backgroundColor: "transparent", boxShadow: "none" }} placeholder={t("password")} value={pwd} onChange={(e) => setPwd(e.target.value)} />
                <span onClick={() => setShowPwd((v) => !v)} style={{ cursor: "pointer", marginLeft: 8, fontSize: "1.1rem", userSelect: "none", color: "#444" }}>
                  
                </span>
              </div>
            </div>
          </FormGroup>

          {forgotLink && (
            <Row className="mb-3">
              <Col className="text-start">
                <Link to={forgotLink} style={{ color: "#0b5c63", fontWeight: "bold", textDecoration: "none" }}>
                  {t("forgotPassword")}
                </Link>
              </Col>
            </Row>
          )}

          {msg && (
            <div style={{ backgroundColor: "#ffe0e0", color: "#7b1515", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontWeight: 600, fontSize: "0.9rem" }}>
              {msg}
            </div>
          )}

          <Row className="mb-3">
            <Col className="text-center">
              <button type="submit" disabled={loading} style={{ backgroundColor: loading ? "#aaa" : accentColor, color: "#fff", border: "none", borderRadius: 30, padding: "11px 70px", fontSize: "1.2rem", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", transition: "background-color 0.3s" }}>
                {loading ? t("loggingIn") : t("login")}
              </button>
            </Col>
          </Row>

          {userType !== "admin" && (
            <Row>
              <Col className="text-center">
                <span style={{ color: "#155b6a", fontSize: "1rem" }}>
                  {userType === "driver" ? t("noDriverAccount") : t("newHere")}
                </span>
                <Link to={userType === "driver" ? "/driver-register" : "/register"} style={{ color: "red", fontWeight: "bold", textDecoration: "none" }}>
                  {t("signUp")}
                </Link>
              </Col>
            </Row>
          )}
        </form>
      </Container>
    </Container>
  );
}
