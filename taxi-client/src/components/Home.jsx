import { Container, Row, Col } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLang } from "./LangContext";

import { logout as userLogout } from "../slices/userSlice";
import { logout as driverLogout } from "../slices/driverSlice";
import { logout as adminLogout } from "../slices/adminSlice";

import homePic from "../images/taxi-call.jpg";
import moneyIcon from "../images/lowest-price.png";
import trustIcon from "../images/trust.png";
import protestIcon from "../images/protest.png";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useLang();

  const handleLogout = () => {
    dispatch(userLogout());
    dispatch(driverLogout());
    dispatch(adminLogout());
    localStorage.removeItem("userToken");
    localStorage.removeItem("driverToken");
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <Container fluid className="p-0">
      <img src={homePic} alt="Hero" style={{ width: "100%", maxHeight: "260px", objectFit: "cover" }} />

      <Container style={{ paddingTop: "40px", paddingBottom: "40px" }}>
        <Row className="text-center" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Col md="4" className="mb-4">
            <img src={moneyIcon} style={{ width: "70px" }} alt="Low price" />
            <h5 style={{ fontWeight: "bold", marginTop: "10px" }}>{t("lowPricesTitle")}</h5>
            <p style={{ textAlign: "start" }}>{t("lowPricesText")}</p>
          </Col>
          <Col md="4" className="mb-4">
            <img src={trustIcon} style={{ width: "70px" }} alt="Trust" />
            <h5 style={{ fontWeight: "bold", marginTop: "10px" }}>{t("trustTitle")}</h5>
            <p style={{ textAlign: "start" }}>{t("trustText")}</p>
          </Col>
          <Col md="4" className="mb-4">
            <img src={protestIcon} style={{ width: "70px" }} alt="Easy" />
            <h5 style={{ fontWeight: "bold", marginTop: "10px" }}>{t("easyTitle")}</h5>
            <p style={{ textAlign: "start" }}>{t("easyText")}</p>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
