import { Container } from "reactstrap";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLang } from "./LangContext";

import moneyIcon from "../images/money.png";

export default function CashPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();
  const currentUser = useSelector((state) => state.user.user);

  const totalFare = location.state?.fare || 0;
  const bookingId = location.state?.bookingId || null;
  const perPerson = (totalFare / 2).toFixed(3);
  const escrow = (totalFare * 0.1).toFixed(3);

  const [msg, setMsg] = useState("");
  const [paid, setPaid] = useState(false);

  const handleConfirm = async () => {
    try {
      const res = await fetch("http://localhost:7500/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(perPerson), escrowAmount: Number(escrow), paymentMethod: "cash", bookingId: bookingId || undefined, payerEmail: currentUser?.userEmail || "" }),
      });
      const data = await res.json();
      if (!res.ok || !data.flag) { setMsg(data.msg || "Payment failed"); return; }
      setPaid(true);
      setMsg(t("cashConfirmed"));
    } catch (err) {
      setMsg("Server error, please try again.");
    }
  };

  return (
    <Container fluid className="d-flex flex-column justify-content-start align-items-center" style={{ minHeight: "100vh", paddingTop: "50px", textAlign: "center" }}>
      <img src={moneyIcon} alt="Cash" style={{ height: "100px", marginBottom: "20px" }} />

      <h2 style={{ color: "#3b2643", fontWeight: 700, fontSize: "2.2rem" }}>{t("cashPayment")}</h2>

      <div style={{ backgroundColor: "#f3e9ff", borderRadius: "12px", padding: "20px 36px", marginTop: "30px", minWidth: "320px", fontSize: "1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontWeight: 600 }}>{t("totalFare")}</span>
          <span>{totalFare} OMR</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontWeight: 600 }}>{t("yourShare")}</span>
          <span style={{ color: "#4b1a9a", fontWeight: 700 }}>{perPerson} OMR</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600 }}>{t("escrowHold")}</span>
          <span style={{ color: "#888" }}>{escrow} OMR</span>
        </div>
      </div>

      <p style={{ marginTop: "24px", color: "#555", fontSize: "1rem", maxWidth: "400px" }}>
        {t("handYourShare")} <strong>{perPerson} OMR</strong> {t("toTheDriver")}
        {" "}{t("platformWillHold")} <strong>{escrow} OMR</strong> {t("inEscrow")}
      </p>

      {!paid ? (
        <button onClick={handleConfirm} style={{ marginTop: "24px", backgroundColor: "#4b1a9a", color: "#fff", border: "none", borderRadius: "30px", padding: "14px 60px", fontSize: "1.2rem", fontWeight: 600, cursor: "pointer" }}>
          {t("confirmCashPayment")}
        </button>
      ) : (
        <button onClick={() => navigate("/my-bookings")} style={{ marginTop: "24px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "30px", padding: "14px 60px", fontSize: "1.2rem", fontWeight: 600, cursor: "pointer" }}>
          {t("leaveFeedbackCash")}
        </button>
      )}

      {msg && <div style={{ marginTop: "16px", fontSize: "1.1rem", fontWeight: 600, color: paid ? "#28a745" : "#c0392b" }}>{msg}</div>}
    </Container>
  );
}
