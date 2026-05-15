import { Container, Row, Col, Button } from "reactstrap"
import { useNavigate } from "react-router-dom"
import { useLang } from "./LangContext"

export default function UserType() {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <Container fluid className="d-flex justify-content-center align-items-center p-0" style={{ minHeight: "100vh", backgroundColor: "#f6e9ff" }}>
      <Container className="text-center">
        <Row className="mb-5">
          <Col>
            <h1 style={{ color: "#4b0082", fontWeight: "bold", fontSize: "2.5rem" }}>
              {t("whatTypeOfUser")}
            </h1>
          </Col>
        </Row>

        <Row className="justify-content-center mt-4">
          <Col xs="10" md="4" className="d-flex justify-content-center mb-4 mb-md-0">
            <Button
              onClick={() => navigate("/driver-register")}
              style={{ backgroundColor: "#9854c6", border: "none", borderRadius: "18px", padding: "50px 40px", width: "260px", fontSize: "1.7rem", fontWeight: "500", color: "#ffffff" }}
            >
              {t("taxiDriver")}
            </Button>
          </Col>
          <Col xs="10" md="4" className="d-flex justify-content-center">
            <Button
              onClick={() => navigate("/register")}
              style={{ backgroundColor: "#9854c6", border: "none", borderRadius: "18px", padding: "50px 40px", width: "260px", fontSize: "1.7rem", fontWeight: "500", color: "#ffffff" }}
            >
              {t("user")}
            </Button>
          </Col>
          <Col xs="10" md="4" className="d-flex justify-content-center">
            <Button
              onClick={() => navigate("/login")}
              style={{ backgroundColor: "#9854c6", border: "none", borderRadius: "18px", padding: "50px 40px", width: "260px", fontSize: "1.7rem", fontWeight: "500", color: "#ffffff" }}
            >
              {t("admin")}
            </Button>
          </Col>
        </Row>
      </Container>
    </Container>
  )
}
