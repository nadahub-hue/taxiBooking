import { Container, Row, Col, FormGroup, Label, Button } from "reactstrap";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLang } from "./LangContext";
import paymentValidationSchema from "../validations/paymentValidation";

import visaImg from "../images/visa.png";
import amexImg from "../images/american-express.png";
import cardsImg from "../images/credit-card.png";

export default function CardPayment() {
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [cardType, setCardType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const currentUser = useSelector((state) => state.user.user);

  const totalFare = location.state?.fare || 10;
  const bookingId = location.state?.bookingId || null;
  const perPerson = (totalFare / 2).toFixed(3);
  const escrow = (totalFare * 0.1).toFixed(3);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: yupResolver(paymentValidationSchema) });

  const onPay = async (formData) => {
    setMsg("");
    try {
      const res = await fetch("http://localhost:7500/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(perPerson), escrowAmount: Number(escrow), paymentMethod: "card", bookingId: bookingId || undefined, payerEmail: currentUser?.userEmail || "" }),
      });
      const data = await res.json();
      if (!res.ok || !data.flag) { setMsg(data.msg || "Payment failed"); setMsgType("error"); return; }
      setMsgType("success");
      setMsg(t("paidSuccessfully"));
      reset();
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (err) {
      setMsg("Server error, please try again.");
      setMsgType("error");
    }
  };

  const fieldStyle = { borderRadius: "18px", padding: "18px", fontSize: "1.1rem", border: "2px solid #000" };
  const errorStyle = { color: "red", fontWeight: "600", marginTop: "8px" };

  return (
    <Container fluid style={{ minHeight: "100vh", display: "flex", justifyContent: "center", paddingTop: "30px" }}>
      <Container style={{ maxWidth: "980px" }}>
        <Row>
          <Col>
            <h1 style={{ fontSize: "3rem", fontWeight: "700", color: "#000", marginBottom: "6px" }}>{t("card")}</h1>

            <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
              <img src={visaImg} alt="Visa" style={{ height: "50px" }} />
              <img src={cardsImg} alt="Cards" style={{ height: "50px" }} />
              <img src={amexImg} alt="Amex" style={{ height: "50px" }} />
            </div>

            <div style={{ backgroundColor: "#f3e9ff", borderRadius: "12px", padding: "16px 22px", marginBottom: "24px", fontSize: "1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>{t("totalFare")}</span>
                <span>{totalFare} OMR</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>{t("yourShare")}</span>
                <span style={{ color: "#4b1a9a", fontWeight: 700 }}>{perPerson} OMR</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{t("escrowHold")}</span>
                <span style={{ color: "#888" }}>{escrow} OMR</span>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <form onSubmit={handleSubmit(onPay)}>
              <FormGroup style={{ marginBottom: "28px" }}>
                <Label style={{ fontSize: "2rem", fontWeight: "600" }}>{t("nameOnCard")}</Label>
                <input className="form-control" style={fieldStyle} {...register("name")} />
                {errors.name && <div style={errorStyle}>{errors.name.message}</div>}
              </FormGroup>

              <FormGroup style={{ marginBottom: "40px" }}>
                <Label style={{ fontSize: "2rem", fontWeight: "600" }}>{t("cardNumber")}</Label>
                <div style={{ position: "relative" }}>
                  <input className="form-control" style={{ ...fieldStyle, paddingRight: "80px" }} placeholder="1234 5678 9012 3456" {...register("number")}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s/g, "");
                      if (val.length >= 4) {
                        const first = val[0];
                        const firstTwo = parseInt(val.substring(0, 2));
                        if (first === "4") setCardType("visa");
                        else if (firstTwo >= 51 && firstTwo <= 55) setCardType("mastercard");
                        else setCardType("");
                      } else { setCardType(""); }
                    }}
                  />
                  {cardType === "visa" && <img src={visaImg} alt="Visa" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", height: 30 }} />}
                  {cardType === "mastercard" && <img src={amexImg} alt="Mastercard" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", height: 30 }} />}
                </div>
                {errors.number && <div style={errorStyle}>{errors.number.message}</div>}
              </FormGroup>

              <Row style={{ marginBottom: "40px" }}>
                <Col md="6">
                  <FormGroup>
                    <Label style={{ fontSize: "2rem", fontWeight: "600" }}>{t("expireDate")}</Label>
                    <div style={{ fontSize: "1.4rem", color: "#777" }}>{t("formatMMYY")}</div>
                    <input className="form-control" style={fieldStyle} placeholder="08/27" {...register("exp")} />
                    {errors.exp && <div style={errorStyle}>{errors.exp.message}</div>}
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label style={{ fontSize: "2rem", fontWeight: "600" }}>{t("securityCode")}</Label>
                    <div style={{ fontSize: "1.4rem", color: "#777" }}>{t("digits")}</div>
                    <input className="form-control" style={fieldStyle} placeholder="123" {...register("cvv")} />
                    {errors.cvv && <div style={errorStyle}>{errors.cvv.message}</div>}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col className="d-flex justify-content-center">
                  <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: "#5a28c8", border: "none", borderRadius: "22px", padding: "16px 60px", fontSize: "1.6rem", fontWeight: "600", width: "60%", opacity: isSubmitting ? 0.7 : 1 }}>
                    {t("pay")}
                  </Button>
                </Col>
              
                <br /><br /><br />
              </Row>

              {msg && (
                <div className={`text-center mt-4 ${msgType === "success" ? "text-success" : msgType === "error" ? "text-danger" : "text-info"}`} style={{ fontSize: "1.5rem", fontWeight: "600" }}>
                  {msg}
                </div>
              )}
            </form>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
