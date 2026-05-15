import { Container, Row, Col, FormGroup } from "reactstrap"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useLang } from "./LangContext"

const SERVER = "http://localhost:7500"

export default function Feedback() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [serverMsg, setServerMsg] = useState("")
  const [hasCompletedBooking, setHasCompletedBooking] = useState(null)

  const currentUser = useSelector((state) => state.user.user)
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn)
  const userEmail = currentUser?.userEmail || ""

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return }
    if (!userEmail) return
    fetch(`${SERVER}/bookings/user/${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        const completed = (data.bookings || []).some((b) => b.status === "completed")
        setHasCompletedBooking(completed)
      })
      .catch(() => setHasCompletedBooking(false))
  }, [userEmail, isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userEmail) { setServerMsg(t("fillAllFields")); return }
    if (!hasCompletedBooking) { setServerMsg(t("onlyAfterCompleting")); return }
    try {
      const res = await fetch(`${SERVER}/sendFeedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, rating, comment }),
      })
      const data = await res.json()
      setServerMsg(data.serverMsg || t("shareMyFeedback"))
    } catch (err) {
      setServerMsg("Something went wrong")
    }
  }

  if (hasCompletedBooking === null) {
    return (
      <div style={{ minHeight: "calc(100vh - 82px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888" }}>{t("checkingEligibility")}</p>
      </div>
    )
  }

  if (hasCompletedBooking === false) {
    return (
      <div style={{ minHeight: "calc(100vh - 82px)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9f3ff" }}>
        <div style={{ textAlign: "center", backgroundColor: "white", borderRadius: 16, padding: "48px 36px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: 440 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🚗</div>
          <h2 style={{ color: "#4b0082", fontWeight: 700, marginBottom: 12 }}>{t("haveYouCompleted")}</h2>
          <p style={{ color: "#666", fontSize: "1rem", marginBottom: 28, lineHeight: 1.6 }}>{t("toLeaveFeedback")}</p>
          <button onClick={() => navigate("/my-bookings")} style={{ backgroundColor: "#6E2F8A", color: "white", border: "none", borderRadius: 24, padding: "12px 32px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}>
            {t("markMyTrip")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <Container fluid className="p-0 d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Container style={{ maxWidth: "800px" }}>
        <Row>
          <Col className="text-center">
            <h1 style={{ fontSize: "3rem", fontWeight: 700, color: "#6E2F8A", marginBottom: "25px" }}>{t("giveFeedback")}</h1>
            <p style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "10px" }}>{t("howWouldYouRate")}</p>

            <FormGroup style={{ marginBottom: "30px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => setRating(star)} style={{ cursor: "pointer", fontSize: "3rem", margin: "0 6px", color: rating >= star ? "#ffb400" : "#e0e0e0", transition: "transform 0.15s" }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}>
                  ★
                </span>
              ))}
            </FormGroup>

            <p style={{ fontSize: "1.5rem", fontWeight: 500, marginBottom: "15px" }}>{t("kindlyTellUs")}</p>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <textarea rows="4" value={comment} onChange={(e) => setComment(e.target.value)} style={{ width: "100%", maxWidth: "600px", margin: "0 auto", display: "block", borderRadius: "18px", border: "none", padding: "15px 18px", fontSize: "1rem", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.12)", resize: "none", backgroundColor: "#ead1e8ff" }} />
              </FormGroup>
              <button type="submit" style={{ backgroundColor: "#4b2c91", color: "#ffffff", border: "none", borderRadius: "40px", padding: "12px 40px", fontSize: "1.2rem", fontWeight: 600, marginTop: "25px", marginBottom: "10px", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
                {t("shareMyFeedback")}
              </button>
            </form>

            {serverMsg && <div style={{ marginTop: "10px", fontSize: "0.95rem", color: "#333" }}>{serverMsg}</div>}
          </Col>
        </Row>
      </Container>
    </Container>
  )
}
