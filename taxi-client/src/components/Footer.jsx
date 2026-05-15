import { useLang } from "./LangContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <div style={{ width: "100%", backgroundColor: "#6a0dad", 
    color: "white", textAlign: "center", padding: "20px 30px",
     fontWeight: "600", fontSize: "1.2rem", margin: 0, display: "block" }}>
      {t("copyright")}
    </div>
  );
}
