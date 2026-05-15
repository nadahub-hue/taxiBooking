import { Container } from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "./LangContext";

import moneyIcon from "../images/money.png";
import cardIcon from "../images/visa.png";

export default function PaymentMethods() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const fare = location.state?.fare || 0;
  const bookingId = location.state?.bookingId || null;

  return (
    <Container fluid className="d-flex flex-column justify-content-start align-items-center" style={{ minHeight: "100vh", paddingTop: "40px", textAlign: "center" }}>
      <img src={moneyIcon} alt="Payment Icon" style={{ height: "120px", marginBottom: "10px" }} />

      <h2 style={{ marginTop: "10px", fontSize: "2rem", color: "#3b2643", fontWeight: "600" }}>
        {t("continueForPayment")}
      </h2>

      <div onClick={() => navigate("/card-payment", { state: { fare, bookingId } })} style={{ marginTop: "60px", display: "flex", alignItems: "center", gap: "20px", cursor: "pointer" }}>
        <img src={cardIcon} alt="Card Icon" style={{ height: "80px" }} />
        <h3 style={{ fontSize: "2.3rem", color: "#3b2643", fontWeight: "600" }}>{t("card")}</h3>
      </div>

      <div onClick={() => navigate("/cash-payment", { state: { fare, bookingId } })} style={{ marginTop: "40px", display: "flex", alignItems: "center", gap: "20px", cursor: "pointer" }}>
        <img src={moneyIcon} alt="Cash Icon" style={{ height: "80px" }} />
        <h3 style={{ fontSize: "2.3rem", color: "#3b2643", fontWeight: "600" }}>{t("cash")}</h3>
      </div>
    </Container>
  );
}
