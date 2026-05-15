import { useState } from "react";
import { Container, Row, Col, FormGroup } from "reactstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLang } from "./LangContext";

const SERVER = "http://localhost:7500";

export default function ChangePassword() {
  const { t } = useLang();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const driver = useSelector((state) => state.driver.driver);
  const isDriverLoggedIn = useSelector((state) => state.driver.isLoggedIn);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("green");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isUserLoggedIn && !isDriverLoggedIn) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (newPassword !== confirmPassword) {
      setMsg(t("passwordsMustMatch"));
      setMsgColor("red");
      return;
    }
    if (newPassword.length < 6) {
      setMsg(t("passwordTooShort"));
      setMsgColor("red");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isDriverLoggedIn) {
        res = await axios.post(`${SERVER}/driver-change-password`, {
          driverEmail: driver.driverEmail,
          currentPassword,
          newPassword,
        });
      } else {
        res = await axios.post(`${SERVER}/change-password`, {
          userEmail: user.userEmail,
          currentPassword,
          newPassword,
        });
      }

      if (res.data?.flag) {
        setMsg(t("passwordChangedSuccess"));
        setMsgColor("green");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMsg(res.data?.msg || t("passwordChangeFailed"));
        setMsgColor("red");
      }
    } catch (err) {
      setMsg(t("passwordChangeFailed"));
      setMsgColor("red");
    }
    setLoading(false);
  };

  const isFormComplete = currentPassword && newPassword && confirmPassword;

  return (
    <Container fluid className="d-flex justify-content-center">
      <Container style={{ maxWidth: "480px", paddingTop: "40px", paddingBottom: "30px" }}>
        <Row className="mb-4">
          <Col className="text-center">
            <h1 style={{ color: "#4b0082", fontWeight: "bold", fontSize: "2.2rem" }}>
              {t("changePasswordTitle")}
            </h1>
          </Col>
        </Row>

        <form onSubmit={handleSubmit}>
          <FormGroup className="mb-3">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>🔒</span>
                <input
                  type={showCurrent ? "text" : "password"}
                  className="form-control border-0"
                  style={{ backgroundColor: "transparent", boxShadow: "none" }}
                  placeholder={t("currentPassword")}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <span onClick={() => setShowCurrent((v) => !v)} style={{ cursor: "pointer", marginLeft: 8, fontSize: "1.1rem", userSelect: "none" }}>
                  {showCurrent ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
          </FormGroup>

          <FormGroup className="mb-3">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>🔑</span>
                <input
                  type={showNew ? "text" : "password"}
                  className="form-control border-0"
                  style={{ backgroundColor: "transparent", boxShadow: "none" }}
                  placeholder={t("newPassword")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <span onClick={() => setShowNew((v) => !v)} style={{ cursor: "pointer", marginLeft: 8, fontSize: "1.1rem", userSelect: "none" }}>
                  {showNew ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
          </FormGroup>

          <FormGroup className="mb-4">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>✅</span>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="form-control border-0"
                  style={{ backgroundColor: "transparent", boxShadow: "none" }}
                  placeholder={t("confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span onClick={() => setShowConfirm((v) => !v)} style={{ cursor: "pointer", marginLeft: 8, fontSize: "1.1rem", userSelect: "none" }}>
                  {showConfirm ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
          </FormGroup>

          <Row className="mb-3">
            <Col className="text-center">
              <button
                type="submit"
                disabled={loading || !isFormComplete}
                style={{
                  backgroundColor: isFormComplete && !loading ? "#3e2aa8" : "#cccccc",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 70px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  cursor: isFormComplete && !loading ? "pointer" : "not-allowed",
                }}
              >
                {loading ? t("saving") : t("changePasswordBtn")}
              </button>
            </Col>
          </Row>

          {msg && (
            <div
              style={{
                backgroundColor: msgColor === "green" ? "#e0ffe0" : "#ffe0e0",
                color: msgColor,
                padding: "10px",
                borderRadius: "10px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {msg}
            </div>
          )}
        </form>
      </Container>
    </Container>
  );
}
