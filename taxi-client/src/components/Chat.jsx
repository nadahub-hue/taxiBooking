import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import profileIcon from "../images/user (1).png";

const SERVER = "https://taxibooking-4-z6lw.onrender.com";
const MESSAGES_POLL_MS = 1500;   
const SIDEBAR_POLL_MS = 3000;   

function useTheme() {
  const [theme, setTheme] = useState(
    () => (typeof document !== "undefined" && document.body.className) || "light"
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.className || "light");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.user.user);
  const navState = location.state || {};
  const myId = String(navState.senderId || currentUser?._id || "");
  const myEmail = navState.senderEmail || currentUser?.userEmail || "";

  const isTripOwner = !navState.tripOwnerId || String(myId) === String(navState.tripOwnerId);


  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [myTrips, setMyTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingMsgType, setBookingMsgType] = useState("");
  const [bookingCreated, setBookingCreated] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineStatus, setOnlineStatus] = useState({});

  const messagesEndRef = useRef(null);
  const activeConvRef = useRef(null);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  const theme = useTheme();
  const isDark = theme === "dark";
  const c = {
    pageBg: isDark ? "#15111f" : "#f0eef8",
    panelBg: isDark ? "#1f1b2e" : "#ffffff",
    panelBgSoft: isDark ? "#27223a" : "#f9f4ff",
    inputBg: isDark ? "#2a223d" : "#f8f5ff",
    border: isDark ? "#3d3357" : "#e0d8f0",
    borderSoft: isDark ? "#2a2541" : "#f5f0fb",
    activeBg: isDark ? "#332650" : "#f3ecff",
    accent: isDark ? "#b388ff" : "#4b1a9a",
    accentDeep: isDark ? "#9a6dff" : "#3c175a",
    text: isDark ? "#f0e6ff" : "#222",
    textHeading: isDark ? "#e8d9ff" : "#3c175a",
    textMuted: isDark ? "#9b8fb8" : "#888",
    textFaded: isDark ? "#6b6485" : "#bbb",
    bubbleOther: isDark ? "#2a223d" : "#ffffff",
    bubbleOtherTx: isDark ? "#f0e6ff" : "#222",
    online: "#4caf50",
    offline: isDark ? "#6b6485" : "#aaa",
    success: isDark ? "#81c784" : "#2e7d32",
    danger: isDark ? "#ff7676" : "#c00",
    bookBtn: "#28a745",
    cancelBtn: isDark ? "#7c4dff" : "#6a1b9a",
    shadow: isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.07)",
    shadowHeader: isDark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.05)",
  };

  const refreshConversations = useCallback(() => {
    if (!myId) return;
    fetch(`${SERVER}/chat/conversations/${myId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setConversations(data.conversations || []);
          setActiveConv((prev) => {
            if (!prev) return prev;
            const updated = (data.conversations || []).find(
              (cv) => String(cv.otherId) === String(prev.otherId)
            );
            return updated
              ? { ...prev, otherName: updated.otherName, otherEmail: updated.otherEmail }
              : prev;
          });
        }
      })
      .catch(() => { });
  }, [myId]);

  const refreshMessages = useCallback(() => {
    const conv = activeConvRef.current;
    if (!conv || !myId) return;
    fetch(`${SERVER}/chat/${myId}/${conv.otherId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.chat) {
          setMessages(
            data.chat.map((m) => ({
              id: m._id,
              sender: String(m.senderId),
              text: m.text,
              isRead: m.isRead,
              time: new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
          );
        }
      })
      .catch(() => { });
  }, [myId]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (!navState.receiverId) return;
    const incoming = {
      otherId: String(navState.receiverId),
      otherName: navState.receiverName || "Companion",
      otherEmail: navState.receiverEmail || "",
      fromLocation: navState.fromLocation || "",
      toLocation: navState.toLocation || "",
      fare: navState.fare || 0,
      lastMessage: "",
    };
    setConversations((prev) => {
      const exists = prev.find((cv) => cv.otherId === String(navState.receiverId));
      return exists ? prev : [incoming, ...prev];
    });
    setActiveConv(incoming);
    setMessages([]);
  }, [navState.receiverId]);

  useEffect(() => {
    if (!myId) return;
    const id = setInterval(refreshConversations, SIDEBAR_POLL_MS);
    return () => clearInterval(id);
  }, [myId, refreshConversations]);

  useEffect(() => {
    if (!activeConv || !myId) return;
    refreshMessages();
    const id = setInterval(refreshMessages, MESSAGES_POLL_MS);
    return () => clearInterval(id);
  }, [activeConv?.otherId, myId, refreshMessages]);


  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    setMessages([]);
    fetch(`${SERVER}/chat/read/${myId}/${conv.otherId}`, { method: "PATCH" }).catch(() => { });
    fetch(`${SERVER}/users/online/${conv.otherId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.flag) {
          setOnlineStatus((prev) => ({ ...prev, [conv.otherId]: data.isOnline }));
        }
      })
      .catch(() => { });
  };

  const handleSend = useCallback(() => {
    const conv = activeConvRef.current;
    if (!newMessage.trim() || !conv || !myId) return;

    const text = newMessage.trim();
    setNewMessage("");

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: String(myId), text, time },
    ]);

    fetch(`${SERVER}/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: myId, receiverId: conv.otherId, text }),
    }).catch(() => { });

    setConversations((prev) =>
      prev.map((cv) =>
        cv.otherId === conv.otherId ? { ...cv, lastMessage: text } : cv
      )
    );
  }, [myId, newMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 82px)",
          backgroundColor: c.pageBg,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "300px",
            minWidth: "300px",
            backgroundColor: c.panelBg,
            borderRight: `1px solid ${c.border}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "20px 18px 14px",
              borderBottom: `1px solid ${c.border}`,
              fontWeight: 700,
              fontSize: "1.15rem",
              color: c.textHeading,
            }}
          >
            💬 Conversations
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {conversations.length === 0 ? (
              <div
                style={{
                  padding: "30px 18px",
                  color: c.textMuted,
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                No conversations yet.
                <br />
                Find a companion from <strong>Search</strong> to start chatting.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConv?.otherId === conv.otherId;
                return (
                  <div
                    key={conv.otherId}
                    onClick={() => handleSelectConv(conv)}
                    style={{
                      padding: "14px 16px",
                      cursor: "pointer",
                      backgroundColor: isActive ? c.activeBg : "transparent",
                      borderLeft: isActive
                        ? `4px solid ${c.accent}`
                        : "4px solid transparent",
                      borderBottom: `1px solid ${c.borderSoft}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={profileIcon}
                        alt="User"
                        style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <span style={{
                        position: "absolute", bottom: 1, right: 1,
                        width: 11, height: 11, borderRadius: "50%",
                        background: onlineStatus[conv.otherId] ? c.online : c.offline,
                        border: `2px solid ${c.panelBg}`,
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: c.textHeading,
                          fontSize: "0.95rem",
                          marginBottom: "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {conv.otherName}
                      </div>
                      {conv.fromLocation && conv.toLocation && (
                        <div
                          style={{
                            fontSize: "0.76rem",
                            color: c.textMuted,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {conv.fromLocation} → {conv.toLocation}
                        </div>
                      )}
                      {conv.lastMessage && (
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: c.textFaded,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: "2px",
                          }}
                        >
                          {conv.lastMessage}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>


        {activeConv ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Header */}
            <div
              style={{
                backgroundColor: c.panelBg,
                padding: "14px 24px",
                borderBottom: `1px solid ${c.border}`,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: c.shadowHeader,
              }}
            >
              <img
                src={profileIcon}
                alt="User"
                style={{ width: "46px", height: "46px", borderRadius: "50%" }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: c.textHeading, display: "flex", alignItems: "center", gap: 8 }}>
                  {activeConv.otherName}
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 600,
                    color: onlineStatus[activeConv.otherId] ? c.online : c.offline,
                  }}>
                    {onlineStatus[activeConv.otherId] ? "● Online" : "● Offline"}
                  </span>
                </div>
                {activeConv.fromLocation && activeConv.toLocation && (
                  <div style={{ fontSize: "0.83rem", color: c.textMuted }}>
                    {activeConv.fromLocation} → {activeConv.toLocation}
                    {activeConv.fare ? ` · ${activeConv.fare} OMR` : ""}
                  </div>
                )}
              </div>

              {isTripOwner ? (
                <button
                  onClick={async () => {
                    setBookingMsg(""); setBookingCreated(null);
                    setShowBookingPanel((v) => {
                      if (v) { setMyTrips([]); setSelectedTripId(""); }
                      return !v;
                    });
                    if (!showBookingPanel && myTrips.length === 0) {
                      try {
                        const ownerId = currentUser?._id || myId;
                        const res = await fetch(`${SERVER}/trips/owner/${ownerId}`);
                        const data = await res.json();
                        setMyTrips(data.trips || []);
                        if (data.trips?.length > 0) setSelectedTripId(data.trips[0]._id);
                      } catch (_) { }
                    }
                  }}
                  style={{
                    marginLeft: "auto",
                    border: "none",
                    backgroundColor: showBookingPanel ? c.cancelBtn : c.bookBtn,
                    color: "#fff",
                    padding: "10px 22px",
                    borderRadius: "22px",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {showBookingPanel ? "✕ Cancel" : "Book Ride"}
                </button>
              ) : null}
            </div>

            {showBookingPanel && (
              <div style={{
                backgroundColor: c.panelBgSoft,
                borderBottom: `1px solid ${c.border}`,
                padding: "18px 24px",
              }}>
                {bookingCreated ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: c.success, fontWeight: 700, fontSize: "1rem", marginBottom: "6px" }}>
                      ✅ Booking sent! Waiting for a driver to accept and set the fare.
                    </div>
                    <div style={{ color: c.textMuted, fontSize: "0.88rem" }}>
                      You will be notified once a driver accepts. Check <b>My Bookings</b> to pay after the driver is assigned.
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, color: c.accent, marginBottom: "12px" }}>
                      Start Booking with <span style={{ color: c.accentDeep }}>{activeConv.otherName}</span>
                    </div>

                    {myTrips.length === 0 ? (
                      <div style={{ color: c.textMuted, fontSize: "0.9rem" }}>
                        You have no posted trips. Go to{" "}
                        <span
                          onClick={() => navigate("/search")}
                          style={{ color: c.accent, cursor: "pointer", fontWeight: 600 }}
                        >
                          Search
                        </span>{" "}
                        and post a trip first.
                      </div>
                    ) : (
                      <>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: c.textMuted, display: "block", marginBottom: "6px" }}>
                          Select your trip:
                        </label>
                        <select
                          value={selectedTripId}
                          onChange={(e) => setSelectedTripId(e.target.value)}
                          style={{
                            width: "100%", padding: "10px 14px",
                            borderRadius: "10px", border: `1px solid ${c.border}`,
                            fontSize: "0.9rem", marginBottom: "12px",
                            backgroundColor: c.inputBg, color: c.text,
                          }}
                        >
                          {myTrips.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.fromLocation} → {t.toLocation} &nbsp;|&nbsp;
                              {new Date(t.travelDate).toLocaleDateString()} &nbsp;|&nbsp;
                              OMR {t.estimatedFare}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={async () => {
                            if (!selectedTripId) return;
                            setBookingMsg("Creating booking…");
                            setBookingMsgType("info");
                            try {
                              const trip = myTrips.find((t) => t._id === selectedTripId);
                              const companionEmail = activeConv.otherEmail || "";
                              const res = await fetch(`${SERVER}/confirmBooking`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  tripId: selectedTripId,
                                  participantEmails: [myEmail, companionEmail].filter(Boolean),
                                  totalFare: 0,
                                  farePerPerson: 0,
                                }),
                              });
                              const data = await res.json();
                              if (data.booking) {
                                setBookingCreated(data.booking);
                                setBookingMsg("");
                              } else {
                                setBookingMsg(data.serverMsg || "Failed to create booking.");
                                setBookingMsgType("error");
                              }
                            } catch (_) {
                              setBookingMsg("Server error. Please try again.");
                              setBookingMsgType("error");
                            }
                          }}
                          style={{
                            background: c.accentDeep, color: "#fff", border: "none",
                            borderRadius: "20px", padding: "10px 28px",
                            fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
                          }}
                        >
                          Confirm &amp; Add {activeConv.otherName}
                        </button>

                        {bookingMsg && (
                          <div style={{
                            marginTop: "10px", fontSize: "0.88rem", fontWeight: 600,
                            color: bookingMsgType === "error" ? c.danger : c.textMuted,
                          }}>{bookingMsg}</div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "22px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: c.textFaded,
                    fontSize: "0.95rem",
                    marginTop: "40px",
                  }}
                >
                  No messages yet. Say hello!
                </div>
              )}

              {messages.map((msg) => {
                const isMe = String(msg.sender) === String(myId);
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "65%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isMe ? c.accent : c.bubbleOther,
                          color: isMe ? "#ffffff" : c.bubbleOtherTx,
                          padding: "11px 16px",
                          borderRadius: isMe
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          fontSize: "0.97rem",
                          lineHeight: "1.45",
                          boxShadow: c.shadow,
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.text}
                      </div>
                      <span
                        style={{
                          marginTop: "4px",
                          fontSize: "0.74rem",
                          color: c.textFaded,
                          padding: "0 4px",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {msg.time}
                        {isMe && (
                          <span style={{ color: msg.isRead ? c.accent : c.textFaded, fontWeight: 700 }}>
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>


            <div
              style={{
                backgroundColor: c.panelBg,
                borderTop: `1px solid ${c.border}`,
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  border: `1px solid ${c.border}`,
                  borderRadius: "30px",
                  padding: "12px 20px",
                  fontSize: "1rem",
                  outline: "none",
                  backgroundColor: c.inputBg,
                  color: c.text,
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  border: "none",
                  backgroundColor: c.accent,
                  color: "#fff",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: c.textFaded,
              gap: "16px",
            }}
          >
            <div style={{ fontSize: "4rem" }}>💬</div>
            <p style={{ fontSize: "1.1rem", color: c.textMuted }}>
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>

      <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.03); }
      }
      input::placeholder { color: ${c.textFaded} !important; }
    `}</style>
    </>
  );
}
