import { Container, Row, Col } from "reactstrap"
import { useLang } from "./LangContext"
import commuImage from "../images/communication.png"

export default function AboutUs() {
  const { t } = useLang()

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh" }}>
      <div style={{ height: "30px" }}></div>
      <Container fluid style={{ padding: "0px 60px 50px 60px" }}>
        <Row style={{ alignItems: "flex-start" }}>
          <Col md="6" xs="12">
            <h1 style={{ fontSize: "4rem", fontWeight: "700", color: "#6E2F8A", marginBottom: "25px" }}>
              {t("aboutUsTitle")}
            </h1>
            <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>{t("aboutP1")}</p>
            <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>{t("aboutP2")}</p>
            <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>{t("aboutP3")}</p>
            <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>{t("aboutP4")}</p>
          </Col>
          <Col md="6" xs="12" className="d-flex justify-content-center align-items-start">
            <img src={commuImage} alt="About illustration" style={{ width: "520px", maxWidth: "100%", marginTop: "10px" }} />
          </Col>
        </Row>
      </Container>
    </Container>
  )
}
