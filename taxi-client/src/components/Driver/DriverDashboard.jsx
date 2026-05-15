import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { updateDriver } from "../../slices/driverSlice";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SERVER = "http://localhost:7500";
const TABS = ["Profile", "Available Rides", "My Rides"];

async function geocode(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (_) {}
  return null;
}

async function geocodeAll(locations) {
  const results = [];
  for (const loc of locations) {
    const coord = await geocode(loc);
    results.push(coord);
    await new Promise((r) => setTimeout(r, 1100));
  }
  return results;
}

export default function DriverDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentDriver = useSelector((state) => state.driver.driver);
  const isDriverLoggedIn = useSelector((state) => state.driver.isLoggedIn);

  const [activeTab, setActiveTab] = useState("Profile");

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editVehicle, setEditVehicle] = useState("");
  const [editMsg, setEditMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [picUploading, setPicUploading] = useState(false);
  const [profilePic, setProfilePic] = useState("");

  const [available, setAvailable] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [acceptMsg, setAcceptMsg] = useState({});
  const [fareInputs, setFareInputs] = useState({});
  const [mapMarkers, setMapMarkers] = useState([]);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [sharingLocation, setSharingLocation] = useState(false);
  const locationIntervalRef = useRef(null);

  const geocodedRef = useRef(false);

  useEffect(() => {
    if (!isDriverLoggedIn) navigate("/driver-login");
  }, [isDriverLoggedIn, navigate]);

  useEffect(() => {
    if (currentDriver) {
      setEditName(currentDriver.driverName || "");
      setEditPhone(currentDriver.driverPhone || "");
      setEditVehicle(currentDriver.vehicleModel || "");
      setProfilePic(currentDriver.profilePic || "");
    }
  }, [currentDriver]);

  useEffect(() => {
    if (activeTab === "Available Rides") fetchAvailable();
    if (activeTab === "My Rides") fetchMyRides();
  }, [activeTab]);

  const fetchAvailable = async () => {
    setLoadingAvail(true);
    geocodedRef.current = false;
    try {
      const res = await fetch(`${SERVER}/bookings/available`);
      const data = await res.json();
      setAvailable(data.bookings || []);
    } catch (_) {}
    setLoadingAvail(false);
  };

  const fetchMyRides = async () => {
    if (!currentDriver?._id) return;
    setLoadingMine(true);
    try {
      const res = await fetch(`${SERVER}/bookings/driver/${currentDriver._id}`);
      const data = await res.json();
      setMyRides(data.bookings || []);
    } catch (_) {}
    setLoadingMine(false);
  };

  useEffect(() => {
    if (available.length === 0 || geocodedRef.current) return;
    geocodedRef.current = true;
    setGeocoding(true);

    const locations = available.map((b) => b.tripId?.fromLocation || "");
    geocodeAll(locations).then((coords) => {
      const markers = available
        .map((b, i) => (coords[i] ? { booking: b, coord: coords[i] } : null))
        .filter(Boolean);
      setMapMarkers(markers);
      setGeocoding(false);
    });
  }, [available]);

  const handleAccept = async (bookingId) => {
    if (!currentDriver?._id) return;
    const fare = fareInputs[bookingId];
    if (!fare || isNaN(Number(fare)) || Number(fare) <= 0) {
      setAcceptMsg((prev) => ({ ...prev, [bookingId]: "Enter a valid fare first" }));
      return;
    }
    setAcceptMsg((prev) => ({ ...prev, [bookingId]: "Processing…" }));
    try {
      const res = await fetch(`${SERVER}/bookings/accept/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: currentDriver._id, farePerPerson: Number(fare) }),
      });
      const data = await res.json();
      if (data.flag) {
        setAcceptMsg((prev) => ({ ...prev, [bookingId]: "✅ Accepted!" }));
        setAvailable((prev) => prev.filter((b) => b._id !== bookingId));
        setMapMarkers((prev) => prev.filter((m) => m.booking._id !== bookingId));
      } else {
        setAcceptMsg((prev) => ({ ...prev, [bookingId]: data.serverMsg || "Failed" }));
      }
    } catch (_) {
      setAcceptMsg((prev) => ({ ...prev, [bookingId]: "Server error" }));
    }
  };

  const handleSaveProfile = async () => {
    if (!currentDriver?._id) return;
    setSaving(true);
    setEditMsg("");
    try {
      const res = await fetch(`${SERVER}/driver/update-profile/${currentDriver._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverName: editName, driverPhone: editPhone, vehicleModel: editVehicle }),
      });
      const data = await res.json();
      if (data.flag) {
        dispatch(updateDriver(data.driver));
        setEditMsg("Profile updated successfully!");
        setEditMode(false);
      } else {
        setEditMsg(data.serverMsg || "Update failed");
      }
    } catch (_) {
      setEditMsg("Server error");
    }
    setSaving(false);
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentDriver?._id) return;
    setPicUploading(true);
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      const res = await fetch(`${SERVER}/driver/update-pic/${currentDriver._id}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.flag) {
        setProfilePic(data.profilePic);
        dispatch(updateDriver(data.driver));
      }
    } catch (_) {}
    setPicUploading(false);
  };

  const toggleLocationSharing = () => {
    if (sharingLocation) {
      clearInterval(locationIntervalRef.current);
      setSharingLocation(false);
      return;
    }

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        fetch(`${SERVER}/driver/location/${currentDriver._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        });
      });
    };

    sendLocation();
    locationIntervalRef.current = setInterval(sendLocation, 10000);
    setSharingLocation(true);
  };

  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  if (!isDriverLoggedIn) return null;

  const d = currentDriver;

  const picSrc = profilePic
    ? `${SERVER}/uploads/${profilePic}`
    : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f0ff", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{
          background: "linear-gradient(135deg, #6a1b9a, #ab47bc)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "#fff",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}>
          <div style={{ position: "relative" }}>
            {picSrc ? (
              <img
                src={picSrc}
                alt="Profile"
                style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" }}
              />
            ) : (
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
              }}>🚗</div>
            )}
            <label style={{
              position: "absolute", bottom: -4, right: -4,
              background: "#fff", borderRadius: "50%",
              width: 22, height: 22, display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}>
              {picUploading ? "⏳" : "📷"}
              <input type="file" accept="image/*" onChange={handlePicChange} style={{ display: "none" }} />
            </label>
          </div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700 }}>Welcome, {d?.driverName || "Driver"}</h2>
            <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: "0.95rem" }}>
              {d?.vehicleModel || ""} {d?.plateNumber ? `· ${d.plateNumber}` : ""}
            </p>
          </div>
          <span style={{
            marginLeft: "auto",
            background: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "20px",
            padding: "4px 16px",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}>
            {d?.status === "verified" ? "Verified ✓" : d?.status}
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 24px",
                borderRadius: "30px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                background: activeTab === tab ? "#7b1fa2" : "#e8d5f5",
                color: activeTab === tab ? "#fff" : "#6a1b9a",
                transition: "all 0.2s",
              }}
            >{tab}</button>
          ))}
        </div>

        {activeTab === "Profile" && (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: "#6a1b9a", margin: 0 }}>Driver Profile</h3>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: "#7b1fa2", color: "#fff", border: "none",
                    borderRadius: "20px", padding: "8px 20px",
                    fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                  }}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      background: saving ? "#aaa" : "#27ae60", color: "#fff", border: "none",
                      borderRadius: "20px", padding: "8px 20px",
                      fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                    }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditMode(false); setEditMsg(""); }}
                    style={{
                      background: "#e0e0e0", color: "#333", border: "none",
                      borderRadius: "20px", padding: "8px 20px",
                      fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {editMsg && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#f0fff0", color: "#2e7d32", fontWeight: 600 }}>
                {editMsg}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                ["Full Name", "driverName", editName, setEditName],
                ["Email", "driverEmail", d?.driverEmail, null],
                ["Phone", "driverPhone", editPhone, setEditPhone],
                ["Vehicle Model", "vehicleModel", editVehicle, setEditVehicle],
                ["Plate Number", "plateNumber", d?.plateNumber, null],
                ["License Number", "licenseNumber", d?.licenseNumber, null],
                ["Taxi Permit Number", "taxiPermitNumber", d?.taxiPermitNumber, null],
                ["National ID", "nationalId", d?.nationalId, null],
                ["Experience (years)", "experienceYears", d?.experienceYears, null],
                ["Account Status", "status", d?.status === "verified" ? "✅ Verified" : d?.status, null],
              ].map(([label, , value, setter]) => (
                <div key={label} style={{ background: "#f8f2ff", borderRadius: "10px", padding: "14px 18px" }}>
                  <div style={{ fontSize: "0.78rem", color: "#9c27b0", fontWeight: 600, marginBottom: "4px" }}>
                    {label}
                  </div>
                  {editMode && setter ? (
                    <input
                      value={value || ""}
                      onChange={(e) => setter(e.target.value)}
                      style={{
                        width: "100%", border: "1px solid #ce93d8",
                        borderRadius: 6, padding: "4px 8px",
                        fontSize: "0.95rem", background: "#fff",
                      }}
                    />
                  ) : (
                    <div style={{ fontWeight: 600, color: "#2d2d2d" }}>{value || "—"}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0e4ff" }}>
              <button
                onClick={toggleLocationSharing}
                style={{
                  background: sharingLocation ? "#e53935" : "#1976d2",
                  color: "#fff", border: "none",
                  borderRadius: "20px", padding: "10px 24px",
                  fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                }}
              >
                {sharingLocation ? "🛑 Stop Sharing Location" : "📍 Share My Location"}
              </button>
              {sharingLocation && (
                <span style={{ marginLeft: 12, color: "#27ae60", fontWeight: 600, fontSize: "0.9rem" }}>
                  Location is being shared with passengers
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "Available Rides" && (
          <div>
            {loadingAvail ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#7b1fa2" }}>Loading bookings…</div>
            ) : available.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", background: "#fff", borderRadius: "14px", color: "#888", fontSize: "1.1rem" }}>
                No available bookings at the moment.
              </div>
            ) : (
              <>
                <div style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", height: "360px" }}>
                  {geocoding && (
                    <div style={{ textAlign: "center", padding: "12px", background: "#fff9e6", fontSize: "0.85rem", color: "#7b5800" }}>
                      📍 Locating pickup points on map…
                    </div>
                  )}
                  <MapContainer center={[23.5880, 58.3829]} zoom={6} style={{ height: geocoding ? "320px" : "360px", width: "100%" }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                    />
                    {mapMarkers.map(({ booking, coord }) => (
                      <Marker
                        key={booking._id}
                        position={[coord.lat, coord.lng]}
                        eventHandlers={{ click: () => setSelectedBookingId(booking._id) }}
                      >
                        <Popup>
                          <strong>{booking.tripId?.fromLocation}</strong>
                          <br />→ {booking.tripId?.toLocation}
                          <br />Date: {booking.tripId?.travelDate ? new Date(booking.tripId.travelDate).toLocaleDateString() : "N/A"}
                          <br />Passengers: {booking.participantEmails?.length || 1}
                          <br />
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Fare per person (OMR)"
                            value={fareInputs[booking._id] || ""}
                            onChange={(e) => setFareInputs((prev) => ({ ...prev, [booking._id]: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginTop: "6px", width: "100%", padding: "4px 6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "0.85rem" }}
                          />
                          <button
                            onClick={() => handleAccept(booking._id)}
                            style={{ marginTop: "6px", background: "#7b1fa2", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", width: "100%" }}
                          >
                            Accept Ride
                          </button>
                          {acceptMsg[booking._id] && (
                            <div style={{ marginTop: "4px", fontSize: "0.8rem" }}>{acceptMsg[booking._id]}</div>
                          )}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: "16px" }}>
                  {available.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBookingId(b._id)}
                      style={{
                        background: "#fff",
                        borderRadius: "14px",
                        padding: "20px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                        borderLeft: selectedBookingId === b._id ? "4px solid #e53935" : "4px solid #9c27b0",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "#6a1b9a" }}>
                          📍 {b.tripId?.fromLocation || "N/A"}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#888" }}>
                          {b.tripId?.travelDate ? new Date(b.tripId.travelDate).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <div style={{ color: "#555", fontSize: "0.9rem", marginBottom: "4px" }}>
                        → <strong>{b.tripId?.toLocation || "N/A"}</strong>
                      </div>
                      <div style={{ color: "#555", fontSize: "0.9rem", marginBottom: "4px" }}>
                        Time: {b.tripId?.travelTime || "N/A"}
                      </div>
                      <div style={{ color: "#555", fontSize: "0.9rem", marginBottom: "4px" }}>
                        Passengers: {b.participantEmails?.length || 1}
                      </div>
                      <div style={{ marginBottom: "10px" }}>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Set fare per person (OMR)"
                          value={fareInputs[b._id] || ""}
                          onChange={(e) => setFareInputs((prev) => ({ ...prev, [b._id]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #c4a8e8", fontSize: "0.9rem" }}
                        />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAccept(b._id); }}
                        disabled={!!acceptMsg[b._id]}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: acceptMsg[b._id] ? "#e0e0e0" : "#7b1fa2",
                          color: acceptMsg[b._id] ? "#555" : "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: 700,
                          cursor: acceptMsg[b._id] ? "default" : "pointer",
                          fontSize: "0.95rem",
                        }}
                      >
                        {acceptMsg[b._id] || "Accept Ride"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "My Rides" && (
          <div>
            {loadingMine ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#7b1fa2" }}>Loading…</div>
            ) : myRides.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", background: "#fff", borderRadius: "14px", color: "#888", fontSize: "1.1rem" }}>
                You have not accepted any rides yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: "16px" }}>
                {myRides.map((b) => (
                  <div key={b._id} style={{
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "20px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                    borderLeft: "4px solid #43a047",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "#2e7d32" }}>
                        📍 {b.tripId?.fromLocation || "N/A"}
                      </span>
                      <span style={{
                        fontSize: "0.75rem",
                        background: b.status === "paid" ? "#e8f5e9" : "#fff3e0",
                        color: b.status === "paid" ? "#2e7d32" : "#e65100",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}>
                        {b.status === "driver_accepted" ? "Active" : b.status}
                      </span>
                    </div>
                    <div style={{ color: "#555", fontSize: "0.9rem", marginBottom: "4px" }}>
                      → <strong>{b.tripId?.toLocation || "N/A"}</strong>
                    </div>
                    <div style={{ color: "#555", fontSize: "0.9rem", marginBottom: "4px" }}>
                      Date: {b.tripId?.travelDate ? new Date(b.tripId.travelDate).toLocaleDateString() : "N/A"} at {b.tripId?.travelTime || ""}
                    </div>
                    <div style={{ color: "#555", fontSize: "0.9rem", marginBottom: "4px" }}>
                      Passengers: {b.participantEmails?.length || 1}
                    </div>
                    <div style={{ color: "#555", fontSize: "0.9rem", marginBottom: "4px" }}>
                      Contact: {b.participantEmails?.join(", ") || "—"}
                    </div>
                    <div style={{ fontWeight: 700, color: "#1565c0", fontSize: "1rem" }}>
                      Fare: OMR {b.totalFare}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "6px" }}>
                      Booked: {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
