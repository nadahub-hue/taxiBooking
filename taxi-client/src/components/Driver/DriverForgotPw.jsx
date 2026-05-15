import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const SERVER = "http://localhost:7500";

export default function DriverForgotPw() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      const res = await fetch(`${SERVER}/driver-forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsgType(data.flag ? "success" : "error");
      setMsg(data.msg);
    } catch {
      setMsgType("error"); setMsg("Server error. Please try again.");
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setMsgType("error"); setMsg("Passwords do not match."); return;
    }
    setMsg(""); setLoading(true);
    try {
      const res = await fetch(`${SERVER}/driver-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      setMsgType(data.flag ? "success" : "error");
      setMsg(data.msg);
      if (data.flag) setTimeout(() => navigate("/driver-login"), 2000);
    } catch {
      setMsgType("error"); setMsg("Server error. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "500px",
    background: "#f5d0d0",
    padding: "14px 18px",
    margin: "10px auto",
    borderRadius: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const btnStyle = {
    width: "80%",
    maxWidth: "400px",
    background: "#8b2c2c",
    color: "#fff",
    borderRadius: "30px",
    padding: "12px",
    fontSize: "18px",
    marginTop: "20px",
    border: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form
        onSubmit={token ? handleReset : handleForgot}
        style={{ width: "100%", maxWidth: "600px", textAlign: "center", padding: "20px" }}
      >
        <h1 style={{ color: "#b42232", marginBottom: "10px" }}>
          {token ? "Reset Driver Password" : "Driver Forgot Password"}
        </h1>
        <p style={{ color: "#777", marginBottom: "24px" }}>
          {token
            ? "Enter your new password below."
            : "Enter your driver account email and we'll send a reset link."}
        </p>

        {!token ? (
          <div style={inputStyle}>
            <span>📧</span>
            <input
              type="email"
              placeholder="Driver Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ flex: 1, border: "none", background: "transparent", fontSize: "17px", outline: "none" }}
            />
          </div>
        ) : (
          <>
            <div style={inputStyle}>
              <span>🔒</span>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ flex: 1, border: "none", background: "transparent", fontSize: "17px", outline: "none" }}
              />
            </div>
            <div style={inputStyle}>
              <span>🔒</span>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                style={{ flex: 1, border: "none", background: "transparent", fontSize: "17px", outline: "none" }}
              />
            </div>
          </>
        )}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Please wait…" : token ? "Reset Password" : "Send Reset Link"}
        </button>

        {msg && (
          <div style={{
            margin: "16px auto 0",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: 600,
            background: msgType === "success" ? "#e8f5e9" : "#ffe0e0",
            color: msgType === "success" ? "#2e7d32" : "#7b1515",
            maxWidth: "500px",
          }}>
            {msg}
          </div>
        )}

        <p style={{ marginTop: "20px", color: "#555" }}>
          Remember your password?{" "}
          <Link to="/driver-login" style={{ color: "#b42232", fontWeight: 700 }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
