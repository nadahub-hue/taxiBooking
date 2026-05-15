import { Container, Row, Col, FormGroup, Label, Button } from "reactstrap";
import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "./LangContext";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function Booking() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state || {};

  const [startLocation, setStartLocation] = useState(prefilled.startLocation || "");
  const [endLocation, setEndLocation]     = useState(prefilled.endLocation || "");
  const [msg, setMsg]                     = useState("");
  const [pickupPin, setPickupPin]         = useState(null);
  const [dropoffPin, setDropoffPin]       = useState(null);
  const [pinMode, setPinMode]             = useState("pickup");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startLocation.trim() || !endLocation.trim()) {
      setMsg(t("fillBothLocations"));
      return;
    }
    setMsg(t("savedSuccessfully"));
    setTimeout(() => {
      navigate("/payment-method", {
        state: {
          startLocation,
          endLocation,
          pickupLat: pickupPin?.[0],
          pickupLng: pickupPin?.[1],
          dropoffLat: dropoffPin?.[0],
          dropoffLng: dropoffPin?.[1],
          fare: prefilled.fare || 0,
        },
      });
    }, 1000);
  };

  const handleMapClick = useCallback((pos) => {
    if (pinMode === "pickup") setPickupPin(pos);
    else setDropoffPin(pos);
  }, [pinMode]);

  return (
    <Container fluid className="py-4">
      <Container style={{ maxWidth: "900px" }}>
        <Row className="mb-4">
          <Col className="text-center">
            <h2 style={{ color: "#4b0082", fontWeight: "700" }}>{t("bookYourRide")}</h2>
            <p style={{ color: "#555" }}>{t("enterLocationsHint")}</p>
          </Col>
        </Row>

        <form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md="6">
              <FormGroup>
                <Label style={{ fontWeight: "600" }}>{t("startLocation")}</Label>
                <input
                  className="form-control"
                  placeholder={t("startLocationPlaceholder")}
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  required
                />
              </FormGroup>
            </Col>

            <Col md="6">
              <FormGroup>
                <Label style={{ fontWeight: "600" }}>{t("endLocation")}</Label>
                <input
                  className="form-control"
                  placeholder={t("endLocationPlaceholder")}
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col className="text-center">
              <Button
                type="submit"
                style={{ backgroundColor: "#4b0082", borderColor: "#4b0082", padding: "10px 40px", fontWeight: "600" }}
              >
                {t("saveLocations")}
              </Button>
            </Col>
          </Row>

          {msg && (
            <Row>
              <Col className="text-center">
                <p style={{ color: msg.includes("✓") ? "green" : "red", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {msg}
                </p>
              </Col>
            </Row>
          )}
        </form>

        <Row>
          <Col>
            <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", height: 420 }}>
              <MapContainer center={[23.5880, 58.3829]} zoom={7} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />
                <MapPicker
                  position={pinMode === "pickup" ? pickupPin : dropoffPin}
                  setPosition={handleMapClick}
                />
                {pickupPin && pinMode !== "pickup" && <Marker position={pickupPin} />}
                {dropoffPin && pinMode !== "dropoff" && <Marker position={dropoffPin} />}
              </MapContainer>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}