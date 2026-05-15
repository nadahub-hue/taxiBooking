import { Container } from "reactstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchTripsThunk, createTripThunk } from "../slices/tripSlice";
import { useLang } from "./LangContext";

import maleIcon from "../images/male.png";
import femaleIcon from "../images/female.png";

const OMAN_PLACES = [
  "Muscat", "Seeb", "Bawshar", "Muttrah", "Al Khuwair",
  "Ruwi", "Wattayah", "Qurum", "Ghubrah", "Al Amarat",
  "Nizwa", "Salalah", "Sur", "Sohar", "Ibri", "Buraimi",
  "Rustaq", "Bahla", "Ibra", "Nakhl", "Samail", "Manah",
  "Izki", "Al Mudaybi", "Al Suwaiq", "Khasab", "Haima",
  "Duqm", "Masirah", "Thumrait", "Mirbat", "Muscat Airport",
  "Seeb Airport", "Salalah Airport",
];

const today = new Date().toISOString().split("T")[0];

const now = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
};

export default function SearchTrips() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useLang();

  const currentUser = useSelector((state) => state.user.user);
  const { trips, loading } = useSelector((state) => state.trip);

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation]     = useState("");
  const [date, setDate]                 = useState("");
  const [gender, setGender]             = useState("any");
  const [searched, setSearched]         = useState(false);

  const [showPostForm, setShowPostForm]   = useState(false);
  const [postFrom, setPostFrom]           = useState("");
  const [postTo, setPostTo]               = useState("");
  const [postDate, setPostDate]           = useState("");
  const [postTime, setPostTime]           = useState("");
  const [postGender, setPostGender]       = useState("any");
  const [postMax, setPostMax]             = useState(3);
  const [postMsg, setPostMsg]             = useState("");
  const [postMsgColor, setPostMsgColor]   = useState("green");

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    dispatch(searchTripsThunk({ fromLocation, toLocation, travelDate: date, genderRestriction: gender }));
  };

  const handlePostTrip = async (e) => {
    e.preventDefault();
    setPostMsg("");

    if (!currentUser) {
      setPostMsg("You must be logged in to post a trip.");
      setPostMsgColor("red");
      return;
    }

    const result = await dispatch(createTripThunk({
      ownerId: currentUser._id,
      ownerName: currentUser.userName,
      ownerEmail: currentUser.userEmail,
      fromLocation: postFrom,
      toLocation: postTo,
      travelDate: postDate,
      travelTime: postTime,
      genderRestriction: postGender,
      estimatedFare: 0,
      maxCompanions: Number(postMax) || 3,
    }));

    if (createTripThunk.fulfilled.match(result)) {
      setPostMsg("Trip posted successfully!");
      setPostMsgColor("green");
      setPostFrom(""); setPostTo(""); setPostDate(""); setPostTime("");
      setPostGender("any"); setPostMax(3);
      setTimeout(() => setShowPostForm(false), 1500);
    } else {
      setPostMsg(result.payload?.serverMsg || "Failed to post trip.");
      setPostMsgColor("red");
    }
  };

  const handleConnect = (trip) => {
    navigate("/chat", {
      state: {
        senderId: currentUser?._id,
        receiverId: trip.ownerId,
        senderName: currentUser?.userName || "You",
        senderEmail: currentUser?.userEmail || "",
        receiverName: trip.ownerName || "Companion",
        receiverEmail: trip.ownerEmail || "",
        fromLocation: trip.fromLocation,
        toLocation: trip.toLocation,
        fare: trip.estimatedFare,
        tripId: trip._id,
        tripOwnerId: trip.ownerId,
      },
    });
  };

  const labelStyle = {
    fontWeight: 500,
    marginBottom: "3px",
    color: "#000",
  };

  const selectStyle = {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "1rem",
    color: "#000",
    backgroundColor: "transparent",
    cursor: "pointer",
  };

  const inputStyle = {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "1rem",
    color: "#000",
    backgroundColor: "transparent",
  };

  return (
    <Container fluid className="p-0">
      <h1
        style={{
          textAlign: "center",
          paddingTop: "40px",
          fontSize: "3rem",
          fontWeight: 700,
          color: "#3c175a",
        }}
      >
        {t("whereDoYouWantToGo")}
      </h1>

      <form onSubmit={handleSearch}>
        <div
          style={{
            margin: "35px auto 0 auto",
            maxWidth: "1000px",
            display: "flex",
            alignItems: "stretch",
            borderRadius: "40px",
            overflow: "hidden",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1.2fr 1.2fr 0.8fr 0.9fr",
              alignItems: "center",
              padding: "18px 30px",
              fontSize: "1.1rem",
            }}
          >
            <div style={{ borderRight: "1px solid #ddd", paddingRight: "15px" }}>
              <div style={labelStyle}>{t("leavingFrom")}</div>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="">{t("selectPlace")}</option>
                {OMAN_PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ borderRight: "1px solid #ddd", paddingLeft: "15px", paddingRight: "15px" }}>
              <div style={labelStyle}>{t("goingTo")}</div>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="">{t("selectPlace")}</option>
                {OMAN_PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ borderRight: "1px solid #ddd", paddingLeft: "15px", paddingRight: "15px" }}>
              <div style={labelStyle}>{t("today")}</div>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", paddingLeft: "15px" }}>
              <div
                style={{ display: "flex", alignItems: "center", marginBottom: "6px", cursor: "pointer" }}
                onClick={() => setGender("male")}
              >
                <img src={maleIcon} alt="Male" style={{ width: "26px", marginRight: "6px" }} />
                <span style={{ fontWeight: gender === "male" ? 700 : 500, color: gender === "male" ? "#1b4f72" : "#000" }}>
                  {t("male")}
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                onClick={() => setGender("female")}
              >
                <img src={femaleIcon} alt="Female" style={{ width: "26px", marginRight: "6px" }} />
                <span style={{ fontWeight: gender === "female" ? 700 : 500, color: gender === "female" ? "#c2185b" : "#000" }}>
                  {t("female")}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              border: "none",
              outline: "none",
              backgroundColor: "#4b1a9a",
              color: "#ffffff",
              padding: "0 60px",
              fontSize: "2rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("searchBtn")}
          </button>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => setShowPostForm((v) => !v)}
          style={{
            border: "2px solid #4b1a9a",
            backgroundColor: showPostForm ? "#4b1a9a" : "transparent",
            color: showPostForm ? "#fff" : "#4b1a9a",
            borderRadius: "30px",
            padding: "10px 36px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {showPostForm ? t("cancel") : t("postYourTrip")}
        </button>
      </div>

      {showPostForm && (
        <form
          onSubmit={handlePostTrip}
          style={{
            maxWidth: "700px",
            margin: "24px auto 0 auto",
            backgroundColor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            padding: "30px 36px",
          }}
        >
          <h3 style={{ color: "#3c175a", fontWeight: 700, marginBottom: "20px" }}>
            {t("postATrip")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={labelStyle}>{t("from")}</div>
              <select
                required
                value={postFrom}
                onChange={(e) => setPostFrom(e.target.value)}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: "10px", padding: "8px 12px", fontSize: "1rem" }}
              >
                <option value="">Select place</option>
                {OMAN_PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <div style={labelStyle}>{t("to")}</div>
              <select
                required
                value={postTo}
                onChange={(e) => setPostTo(e.target.value)}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: "10px", padding: "8px 12px", fontSize: "1rem" }}
              >
                <option value="">{t("selectPlace")}</option>
                {OMAN_PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <div style={labelStyle}>{t("date")}</div>
              <input
                type="date"
                required
                min={today}
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: "10px", padding: "8px 12px", fontSize: "1rem" }}
              />
            </div>

            <div>
              <div style={labelStyle}>{t("time")}</div>
              <input
                type="time"
                required
                min={postDate === today ? now() : undefined}
                value={postTime}
                onChange={(e) => setPostTime(e.target.value)}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: "10px", padding: "8px 12px", fontSize: "1rem" }}
              />
            </div>

            <div>
              <div style={labelStyle}>{t("maxCompanions")}</div>
              <input
                type="number"
                min="1"
                max="10"
                value={postMax}
                onChange={(e) => setPostMax(e.target.value)}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: "10px", padding: "8px 12px", fontSize: "1rem" }}
              />
            </div>

            <div>
              <div style={labelStyle}>{t("companionGenderPref")}</div>
              <select
                value={postGender}
                onChange={(e) => setPostGender(e.target.value)}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: "10px", padding: "8px 12px", fontSize: "1rem" }}
              >
                <option value="any">{t("any")}</option>
                <option value="male">{t("maleOnly")}</option>
                <option value="female">{t("femaleOnly")}</option>
              </select>
            </div>
          </div>

          <p style={{ marginTop: "14px", color: "#888", fontSize: "0.9rem" }}>
            {t("fareSetByDriver")}
          </p>

          <button
            type="submit"
            style={{
              marginTop: "12px",
              width: "100%",
              backgroundColor: "#4b1a9a",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              padding: "12px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("postTrip")}
          </button>

          {postMsg && (
            <div style={{ marginTop: "12px", textAlign: "center", color: postMsgColor, fontWeight: 600 }}>
              {postMsg}
            </div>
          )}
        </form>
      )}

      {loading && (
        <div style={{ textAlign: "center", marginTop: "40px", fontSize: "1.2rem", color: "#4b1a9a" }}>
          {t("searching")}
        </div>
      )}

      {!loading && searched && trips.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px", fontSize: "1.2rem", color: "#888" }}>
          {t("noTripsFound")}
        </div>
      )}

      {!loading && trips.length > 0 && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "35px auto 0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            paddingBottom: "40px",
          }}
        >
          {trips.map((trip) => (
            <div
              key={trip._id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                padding: "22px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                transition: "box-shadow 0.2s",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#3c175a", marginBottom: "8px" }}>
                  {trip.fromLocation} → {trip.toLocation}
                </div>

                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", color: "#555", fontSize: "0.97rem" }}>
                  <span><strong>{t("dateLabel")}:</strong> {new Date(trip.travelDate).toLocaleDateString()}</span>
                  <span><strong>{t("time")}:</strong> {trip.travelTime || "—"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <strong>Gender:</strong>
                    {trip.genderRestriction === "male" && <img src={maleIcon} alt="Male" style={{ width: "20px" }} />}
                    {trip.genderRestriction === "female" && <img src={femaleIcon} alt="Female" style={{ width: "20px" }} />}
                    {trip.genderRestriction === "any" && <span>{t("any")}</span>}
                  </span>
                  {trip.ownerName && <span><strong>{t("postedBy")}:</strong> {trip.ownerName}</span>}
                </div>
              </div>

              <button
                onClick={() => handleConnect(trip)}
                disabled={!trip.ownerId || String(trip.ownerId) === String(currentUser?._id)}
                style={{
                  border: "none",
                  backgroundColor:
                    !trip.ownerId || String(trip.ownerId) === String(currentUser?._id)
                      ? "#cccccc"
                      : "#4b1a9a",
                  color: "#ffffff",
                  borderRadius: "22px",
                  padding: "12px 30px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor:
                    !trip.ownerId || String(trip.ownerId) === String(currentUser?._id)
                      ? "not-allowed"
                      : "pointer",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.2s",
                }}
              >
                {String(trip.ownerId) === String(currentUser?._id) ? t("yourTrip") : t("connect")}
              </button>
            </div>
          ))}
        </div>
      )}

      {!searched && !showPostForm && (
        <div style={{ marginTop: "35px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#171129" }}>
            {t("findPerfectRide")}
          </h2>
          <br /><br /><br /><br /><br /><br /><br /><br /><br />
        </div>
      )}
    </Container>
  );
}
