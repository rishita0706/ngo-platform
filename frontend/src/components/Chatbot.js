import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

const TABS = { CHAT: "chat", RECOMMEND: "recommend" };

function Chatbot() {
  const [open,    setOpen]    = useState(false);
  const [tab,     setTab]     = useState(TABS.CHAT);

  // Chat state
  const [message, setMessage] = useState("");
  const [chat,    setChat]    = useState([
    { sender: "bot", text: "Hi! I'm the NayePankh AI assistant. Ask me about volunteering, donating, or get a personalised role suggestion! 🌟" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Recommend state
  const [form,    setForm]    = useState({ skills: "", interest: "" });
  const [recResult, setRecResult] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, open]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || loading) return;

    setChat(prev => [...prev, { sender: "user", text }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/chat", { message: text });
      setChat(prev => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch {
      setChat(prev => [...prev, { sender: "bot", text: "Server error — please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = async () => {
    if (!form.skills.trim() || !form.interest.trim() || recLoading) return;
    setRecLoading(true);
    setRecResult(null);
    try {
      const res = await axios.post("http://localhost:5000/predict", {
        skills:   form.skills.trim().toLowerCase(),
        interest: form.interest.trim().toLowerCase(),
      });
      setRecResult(res.data.role);
    } catch {
      setRecResult("Error — please try again.");
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        className={`chatbot-fab${open ? " chatbot-fab--open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open NayePankh AI chat"}
      >
        <span className="chatbot-fab__icon">{open ? "✕" : "🤖"}</span>
        {!open && <span className="chatbot-fab__pulse" aria-hidden="true" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window" role="dialog" aria-label="NayePankh AI assistant">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <span className="chatbot-header__avatar">🤖</span>
              <div>
                <div className="chatbot-header__name">NayePankh AI</div>
                <div className="chatbot-header__status">
                  <span className="chatbot-header__dot" />
                  Online
                </div>
              </div>
            </div>
            <button className="chatbot-header__close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          {/* Tabs */}
          <div className="chatbot-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === TABS.CHAT}
              className={`chatbot-tab${tab === TABS.CHAT ? " chatbot-tab--active" : ""}`}
              onClick={() => setTab(TABS.CHAT)}
            >
              💬 Chat
            </button>
            <button
              role="tab"
              aria-selected={tab === TABS.RECOMMEND}
              className={`chatbot-tab${tab === TABS.RECOMMEND ? " chatbot-tab--active" : ""}`}
              onClick={() => setTab(TABS.RECOMMEND)}
            >
              🎯 Role Match
            </button>
          </div>

          {/* Chat panel */}
          {tab === TABS.CHAT && (
            <>
              <div className="chatbot-messages" role="log" aria-live="polite">
                {chat.map((msg, i) => (
                  <div key={i} className={`chatbot-msg chatbot-msg--${msg.sender}`}>
                    {msg.sender === "bot" && (
                      <span className="chatbot-msg__avatar" aria-hidden="true">🤖</span>
                    )}
                    <span className="chatbot-msg__bubble">{msg.text}</span>
                  </div>
                ))}
                {loading && (
                  <div className="chatbot-msg chatbot-msg--bot">
                    <span className="chatbot-msg__avatar" aria-hidden="true">🤖</span>
                    <span className="chatbot-msg__bubble chatbot-msg__typing">
                      <span /><span /><span />
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="chatbot-input-row">
                <input
                  className="chatbot-input"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message…"
                  aria-label="Chat message"
                  disabled={loading}
                />
                <button
                  className="chatbot-send"
                  onClick={sendMessage}
                  disabled={!message.trim() || loading}
                  aria-label="Send"
                >
                  ➤
                </button>
              </div>
            </>
          )}

          {/* Recommend panel */}
          {tab === TABS.RECOMMEND && (
            <div className="chatbot-recommend">
              <p className="chatbot-recommend__desc">
                Tell us about your skills and interests — our AI will suggest the best volunteer role for you.
              </p>
              <div className="chatbot-recommend__form">
                <label className="chatbot-recommend__label">Your Skills</label>
                <input
                  className="form-input"
                  placeholder="e.g. teaching, coding, social work"
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  aria-label="Your skills"
                />
                <label className="chatbot-recommend__label">Your Interest</label>
                <input
                  className="form-input"
                  placeholder="e.g. education, web, community"
                  value={form.interest}
                  onChange={e => setForm({ ...form, interest: e.target.value })}
                  aria-label="Your interest"
                />
                <button
                  className="btn btn-primary btn-full"
                  onClick={getRecommendation}
                  disabled={!form.skills.trim() || !form.interest.trim() || recLoading}
                >
                  {recLoading ? "Finding match…" : "Get My Role →"}
                </button>
              </div>
              {recResult && (
                <div className="chatbot-recommend__result">
                  <div className="chatbot-recommend__result-label">Recommended Role</div>
                  <div className="chatbot-recommend__result-role">🎯 {recResult}</div>
                  <p className="chatbot-recommend__result-sub">
                    Head to the Volunteer page to register with this role!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Chatbot;


// import { useState } from "react";
// import axios from "axios";

// function Chatbot() {
//   const [open, setOpen] = useState(false);

//   // Chat states
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);

//   // Recommendation form states
//   const [form, setForm] = useState({
//     skills: "",
//     interest: "",
//   });

//   // Send chat message
//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     const userMsg = { sender: "user", text: message };

//     setChat((prev) => [...prev, userMsg]);

//     try {
//       const res = await axios.post("http://localhost:5000/chat", {
//         message,
//       });

//       const botMsg = {
//         sender: "bot",
//         text: res.data.reply,
//       };

//       setChat((prev) => [...prev, botMsg]);
//     } catch (error) {
//       console.error(error);

//       setChat((prev) => [
//         ...prev,
//         {
//           sender: "bot",
//           text: "Server error. Please try again.",
//         },
//       ]);
//     }

//     setMessage("");
//   };

//   // Get volunteer recommendation
//   const getRecommendation = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/predict", {
//         skills: form.skills.toLowerCase(),
//         interest: form.interest.toLowerCase(),
//       });

//       setChat((prev) => [
//         ...prev,
//         {
//           sender: "bot",
//           text: `🎯 Recommended Role: ${res.data.role}`,
//         },
//       ]);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to get recommendation");
//     }
//   };

//   return (
//     <>
//       {/* Floating Chat Button */}
//       <button
//         onClick={() => setOpen(!open)}
//         style={{
//           position: "fixed",
//           bottom: "20px",
//           right: "20px",
//           width: "60px",
//           height: "60px",
//           borderRadius: "50%",
//           background: "#007bff",
//           color: "white",
//           border: "none",
//           fontSize: "24px",
//           cursor: "pointer",
//           boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
//         }}
//       >
//         🤖
//       </button>

//       {/* Chat Window */}
//       {open && (
//         // <div
//         //   style={{
//         //     position: "fixed",
//         //     bottom: "90px",
//         //     right: "20px",
//         //     width: "350px",
//         //     height: "500px",
//         //     background: "#fff",
//         //     border: "1px solid #ddd",
//         //     borderRadius: "12px",
//         //     boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
//         //     display: "flex",
//         //     flexDirection: "column",
//         //     overflow: "hidden",
//         //   }}
//         // >
//         <div style={{
//           position: "fixed",
//           bottom: "80px",
//           right: "20px",
//           width: "320px",
//           height: "420px",
//           background: "white",
//           borderRadius: "10px",
//           boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
//           display: "flex",
//           flexDirection: "column"
//         }}>
//           {/* Header */}
//           <div
//             style={{
//               background: "#007bff",
//               color: "white",
//               padding: "12px",
//               textAlign: "center",
//               fontWeight: "bold",
//             }}
//           >
//             NayePankh AI 🤖
//           </div>

//           {/* Chat Area */}
//           <div
//             style={{
//               flex: 1,
//               overflowY: "auto",
//               padding: "10px",
//             }}
//           >
//             {chat.map((msg, index) => (
//               <div
//                 key={index}
//                 style={{
//                   textAlign:
//                     msg.sender === "user" ? "right" : "left",
//                   marginBottom: "8px",
//                 }}
//               >
//                 <span
//                   style={{
//                     display: "inline-block",
//                     padding: "8px 12px",
//                     borderRadius: "12px",
//                     background:
//                       msg.sender === "user"
//                         ? "#007bff"
//                         : "#f1f1f1",
//                     color:
//                       msg.sender === "user"
//                         ? "white"
//                         : "black",
//                   }}
//                 >
//                   {msg.text}
//                 </span>
//               </div>
//             ))}
//           </div>

//           {/* Chat Input */}
//           <div
//             style={{
//               display: "flex",
//               padding: "10px",
//               borderTop: "1px solid #ddd",
//             }}
//           >
//             <input
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Ask something..."
//               style={{
//                 flex: 1,
//                 padding: "8px",
//                 marginRight: "5px",
//               }}
//               onKeyDown={(e) =>
//                 e.key === "Enter" && sendMessage()
//               }
//             />
//             <button onClick={sendMessage}>Send</button>
//           </div>

//           {/* Recommendation Section */}
//           <div
//             style={{
//               borderTop: "1px solid #ddd",
//               padding: "10px",
//               background: "#fafafa",
//             }}
//           >
//             <h4 style={{ margin: "0 0 10px 0" }}>
//               Volunteer Recommendation 🎯
//             </h4>

//             <input
//               placeholder="Skills (teaching / tech / social)"
//               value={form.skills}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   skills: e.target.value,
//                 })
//               }
//               style={{
//                 width: "100%",
//                 padding: "8px",
//                 marginBottom: "8px",
//               }}
//             />

//             <input
//               placeholder="Interest (education / web / community)"
//               value={form.interest}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   interest: e.target.value,
//                 })
//               }
//               style={{
//                 width: "100%",
//                 padding: "8px",
//                 marginBottom: "8px",
//               }}
//             />

//             <button
//               onClick={getRecommendation}
//               style={{
//                 width: "100%",
//                 padding: "8px",
//               }}
//             >
//               Get Recommendation
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Chatbot;