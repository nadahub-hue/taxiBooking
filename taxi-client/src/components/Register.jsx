import { useState } from "react";
import { Container, Row, Col, FormGroup } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLang } from "./LangContext";

import regFormValidationSchema from "../validations/registerValidation";
import { newUserThunk } from "../slices/userSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLang();

  const [serverMsg, setServerMsg] = useState("");
  const [gender, setGender] = useState("");
  const [preferredGender, setPreferredGender] = useState("any");
  const [showPwd, setShowPwd] = useState(false);
  const [showCnfPwd, setShowCnfPwd] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: yupResolver(regFormValidationSchema) });

  const watched = watch(["fullName", "email", "phone", "pwd", "cnfPwd"]);
  const isFormComplete = watched.every((v) => v && v.trim() !== "") && gender !== "";

  const onSubmit = (formData) => {
    setServerMsg("");
    dispatch(newUserThunk({ ...formData, gender, preferredGender })).then((res) => {
      const payload = res?.payload;
      if (payload && payload.flag) {
        navigate("/login");
      } else {
        setServerMsg(payload?.serverMsg || "Account already exists");
      }
    });
  };

  return (
    <Container fluid className="d-flex justify-content-center">
      <Container style={{ maxWidth: "480px", paddingTop: "40px", paddingBottom: "30px" }}>
        <Row className="mb-4">
          <Col className="text-center">
            <h1 style={{ color: "#4b0082", fontWeight: "bold", fontSize: "2.5rem" }}>{t("customerRegister")}</h1>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col className="d-flex justify-content-center">
            <div style={{ display: "inline-flex", borderRadius: "40px", overflow: "hidden" }}>
              <button type="button" onClick={() => navigate("/login")} style={{ border: "none", padding: "10px 30px", backgroundColor: "#c0b4ff", color: "#ffffff", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer" }}>
                {t("login")}
              </button>
              <button type="button" style={{ border: "none", padding: "10px 30px", backgroundColor: "#3e005a", color: "#ffffff", fontSize: "1.1rem", fontWeight: "bold", cursor: "default" }}>
                {t("signUp")}
              </button>
            </div>
          </Col>
        </Row>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup className="mb-3">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>👤</span>
                <input className="form-control border-0" style={{ backgroundColor: "transparent", boxShadow: "none" }} placeholder={t("name")} {...register("fullName")} />
              </div>
            </div>
            <small className="text-danger">{errors.fullName?.message}</small>
          </FormGroup>

          <FormGroup className="mb-3">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>📧</span>
                <input type="email" className="form-control border-0" style={{ backgroundColor: "transparent", boxShadow: "none" }} placeholder={t("emailAddress")} {...register("email")} />
              </div>
            </div>
            <small className="text-danger">{errors.email?.message}</small>
          </FormGroup>

          <FormGroup className="mb-3">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>📞</span>
                <input className="form-control border-0" style={{ backgroundColor: "transparent", boxShadow: "none" }} placeholder={t("phoneNumber")} {...register("phone")} />
              </div>
            </div>
            <small className="text-danger">{errors.phone?.message}</small>
          </FormGroup>

          <FormGroup className="mb-3">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>🔒</span>
                <input type={showPwd ? "text" : "password"} className="form-control border-0" style={{ backgroundColor: "transparent", boxShadow: "none" }} placeholder={t("password")} {...register("pwd")} />
                <span onClick={() => setShowPwd((v) => !v)} style={{ cursor: "pointer", marginLeft: 8, fontSize: "1.1rem", userSelect: "none" }}></span>
              </div>
            </div>
            <small className="text-danger">{errors.pwd?.message}</small>
          </FormGroup>

          <FormGroup className="mb-4">
            <div style={{ backgroundColor: "#9cb4e2", borderRadius: "20px", padding: "10px 16px" }}>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: "10px" }}>✅</span>
                <input type={showCnfPwd ? "text" : "password"} className="form-control border-0" style={{ backgroundColor: "transparent", boxShadow: "none" }} placeholder={t("confirmPassword")} {...register("cnfPwd")} />
                <span onClick={() => setShowCnfPwd((v) => !v)} style={{ cursor: "pointer", marginLeft: 8, fontSize: "1.1rem", userSelect: "none" }}></span>
              </div>
            </div>
            <small className="text-danger">{errors.cnfPwd?.message}</small>
          </FormGroup>

 

          <Row className="mb-3">
            <Col className="text-center">
              <button
                type="submit"
                disabled={!isFormComplete}
                style={{ backgroundColor: isFormComplete ? "#3e005a" : "#aaa", color: "#ffffff", border: "none", borderRadius: "30px", padding: "10px 60px", fontSize: "1.4rem", fontWeight: "bold", cursor: isFormComplete ? "pointer" : "not-allowed" }}
              >
                {t("signUp")}
              </button>
            </Col>
          </Row>

          <Row>
            <Col className="text-center">
              <span style={{ color: "#155b6a", fontSize: "1rem" }}>{t("alreadyHaveAccount")}</span>
              <Link to="/login" style={{ color: "red", fontWeight: "bold", textDecoration: "none" }}>{t("login")}</Link>
            </Col>
          </Row>

          {serverMsg && <div className="alert alert-danger mt-3 text-center">{serverMsg}</div>}
        </form>
      </Container>
    </Container>
  );
}
