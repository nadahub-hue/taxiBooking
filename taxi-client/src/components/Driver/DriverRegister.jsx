import { useState } from "react";
import { Container } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { newDriverThunk } from "../../slices/driverSlice.js";
import driverRegValidationSchema from "../../validations/DriverRejValidation.jsx";

export default function DriverRegister() {
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [cnfPwd, setCnfPwd] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [taxiPermitNumber, setTaxiPermitNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [licenseFile, setLicenseFile] = useState(null);
  const [permitFile, setPermitFile] = useState(null);
  const [carRegistrationFile, setCarRegistrationFile] = useState(null);
  const [serverMsg, setServerMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isFormComplete =
    driverName.trim() && driverPhone.trim() && driverEmail.trim() &&
    driverPassword && cnfPwd && licenseNumber.trim() &&
    taxiPermitNumber.trim() && vehicleModel.trim() && plateNumber.trim() &&
    nationalId.trim() && String(experienceYears).trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");
    setIsSubmitting(true);

    const formData = {
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      driverEmail: driverEmail.trim(),
      driverPassword,
      cnfPwd,
      licenseNumber: licenseNumber.trim(),
      taxiPermitNumber: taxiPermitNumber.trim(),
      vehicleModel: vehicleModel.trim(),
      plateNumber: plateNumber.trim(),
      nationalId: nationalId.trim(),
      experienceYears: Number(experienceYears),
    };

    try {
      await driverRegValidationSchema.validate(formData, { abortEarly: true });

      const data = new FormData();
      data.append("driverName", formData.driverName);
      data.append("driverPhone", formData.driverPhone);
      data.append("driverEmail", formData.driverEmail);
      data.append("driverPassword", formData.driverPassword);
      data.append("licenseNumber", formData.licenseNumber);
      data.append("taxiPermitNumber", formData.taxiPermitNumber);
      data.append("vehicleModel", formData.vehicleModel);
      data.append("plateNumber", formData.plateNumber);
      data.append("nationalId", formData.nationalId);
      data.append("experienceYears", formData.experienceYears);

      if (licenseFile) data.append("licenseFile", licenseFile);
      if (permitFile) data.append("permitFile", permitFile);
      if (carRegistrationFile) data.append("carRegistrationFile", carRegistrationFile);

      const resultAction = await dispatch(newDriverThunk(data));

      if (newDriverThunk.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload?.flag) {
          setServerMsg(payload?.serverMsg || "Driver registered successfully. Please log in.");
          setTimeout(() => {
            navigate("/driver-login");
          }, 1200);
        } else {
          setServerMsg(payload?.serverMsg || "Driver registration failed");
        }
      } else {
        setServerMsg(
          resultAction.payload?.serverMsg ||
            resultAction.error?.message ||
            "Driver registration failed"
        );
      }
    } catch (error) {
      setServerMsg(error?.message || "Validation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "650px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#b42232", marginBottom: "30px" }}>
          Driver register
        </h1>

        <div className="inputBox">
          <span className="icon">👤</span>
          <input
            type="text"
            placeholder="Full Name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">📧</span>
          <input
            type="email"
            placeholder="Email Address"
            value={driverEmail}
            onChange={(e) => setDriverEmail(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">📞</span>
          <input
            type="text"
            placeholder="Phone Number"
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">🪪</span>
          <input
            type="text"
            placeholder="Driving License Number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">🚕</span>
          <input
            type="text"
            placeholder="Taxi Permit / Badge Number"
            value={taxiPermitNumber}
            onChange={(e) => setTaxiPermitNumber(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">🚗</span>
          <input
            type="text"
            placeholder="Vehicle Model"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">🔢</span>
          <input
            type="text"
            placeholder="Vehicle Plate Number"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">🆔</span>
          <input
            type="text"
            placeholder="National ID / Resident Card Number"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">⏳</span>
          <input
            type="number"
            placeholder="Years of Driving Experience"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">🔒</span>
          <input
            type="password"
            placeholder="Password"
            value={driverPassword}
            onChange={(e) => setDriverPassword(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">✔️</span>
          <input
            type="password"
            placeholder="Confirm Password"
            value={cnfPwd}
            onChange={(e) => setCnfPwd(e.target.value)}
          />
        </div>

        <div className="inputBox">
          <span className="icon">📄</span>
          <span style={{ fontSize: "14px", marginRight: "8px", color: "#555" }}>License PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setLicenseFile(e.target.files[0])}
          />
        </div>

        <div className="inputBox">
          <span className="icon">📄</span>
          <span style={{ fontSize: "14px", marginRight: "8px", color: "#555" }}>Permit PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPermitFile(e.target.files[0])}
          />
        </div>

        <div className="inputBox">
          <span className="icon">📄</span>
          <span style={{ fontSize: "14px", marginRight: "8px", color: "#555" }}>Car Registration PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setCarRegistrationFile(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFormComplete}
          style={{
            width: "80%",
            backgroundColor: isFormComplete && !isSubmitting ? "#8b2c2c" : "#aaa",
            color: "white",
            borderRadius: "30px",
            padding: "12px",
            fontSize: "20px",
            marginTop: "20px",
            border: "none",
            cursor: isFormComplete && !isSubmitting ? "pointer" : "not-allowed",
          }}
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>

        {serverMsg && (
          <div
            style={{
              backgroundColor: "#ffe0e0",
              color: "#7b1515",
              padding: "10px",
              marginTop: "15px",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            {serverMsg}
          </div>
        )}

        <p style={{ marginTop: "15px", fontSize: "18px" }}>
          Already have an account?{" "}
          <Link to="/driver-login" style={{ color: "#b42232", fontWeight: "bold" }}>
            LOGIN
          </Link>
        </p>
      </form>

      <style>{`
        .inputBox {
          width: 100%;
          max-width: 550px;
          background-color: #ffb4b4;
          padding: 14px 18px;
          margin: 12px auto;
          border-radius: 25px;
          display: flex;
          align-items: center;
        }
        .inputBox .icon {
          font-size: 20px;
          margin-right: 10px;
        }
        .inputBox input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 18px;
          outline: none;
        }
      `}</style>
    </Container>
  );
}
