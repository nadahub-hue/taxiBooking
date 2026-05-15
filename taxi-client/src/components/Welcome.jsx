import { Container, Row, Col, Button } from "reactstrap"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { useLang } from "./LangContext"
import welcomeImg from "../images/welcome photo.png"

export default function Welcome() {
  const navigate = useNavigate()
  const { t } = useLang()

  const isUserLoggedIn   = useSelector((s) => s.user.isLoggedIn)
  const isDriverLoggedIn = useSelector((s) => s.driver.isLoggedIn)
  const isAdminLoggedIn  = useSelector((s) => s.admin.isLoggedIn)
  const isLoggedIn = isUserLoggedIn || isDriverLoggedIn || isAdminLoggedIn

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh" }}>
      <Row className="m-0 d-flex flex-column justify-content-between" style={{ minHeight: "100vh" }}>
        <Col className="d-flex align-items-center justify-content-center">
          <Row className="w-100 m-0 align-items-center justify-content-center" style={{ maxWidth: "900px" }}>
            <Col md="6" className="text-center text-md-start">
              <h1 style={{ color: "#7b238e", fontWeight: 700, fontSize: "3rem" }}>Travel</h1>
              <h1 style={{ color: "#800d0dff", fontWeight: 700, fontSize: "3rem", marginTop: "-10px", marginLeft: "30px" }}>Buddy</h1>
            </Col>
            <Col md="6" className="text-center mt-4 mt-md-0 d-flex flex-column align-items-center">
              <img src={welcomeImg} alt="Travel Buddy" style={{ maxWidth: "320px", width: "100%" }} />
            </Col>
          </Row>
        </Col>

        <Col className="text-center mt-3">
          <p style={{ color: "#800d0dff", fontSize: "50px", fontWeight: "bold", marginBottom: "10px" }}>
            {t("welcome")}
          </p>
        </Col>

       <Col xs="12" className="p-0 mt-auto">
  {!isLoggedIn && (
      <Button
        className="border-0 rounded-0 w-100"
        style={{
          backgroundColor: "#3e005a",
          color: "#ffffff",
          fontSize: "2rem",
          fontWeight: 250,
          letterSpacing: "0.15em",
          padding: "50px 0",
          display: "block"
        }}
        onClick={() => navigate("/user-type")}
      >
        {t("getStarted")}
      </Button>
  )}
</Col>
 
      </Row>
    </Container>
  )
}
