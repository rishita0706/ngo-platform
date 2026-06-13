// import { useState } from "react";
// import axios from "axios";

// function App() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     skills: "",
//     interest: ""
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       await axios.post("http://localhost:5000/volunteer", form);
//       alert("Volunteer Registered ✅");
//     } catch (error) {
//       alert("Error submitting form");
//     }
//   };

//   return (
//     <div style={{
//       textAlign: "center",
//       marginTop: "50px",
//       fontFamily: "Arial"
//      }}>
//       <h1>NayePankh AI Platform</h1>

//       <input style={{padding:"10px", margin:"5px"}} name="name" placeholder="Name" onChange={handleChange} /><br/>
//       <input style={{padding:"10px", margin:"5px"}} name="email" placeholder="Email" onChange={handleChange} /><br/>
//       <input style={{padding:"10px", margin:"5px"}} name="skills" placeholder="Skills" onChange={handleChange} /><br/>
//       <input style={{padding:"10px", margin:"5px"}} name="interest" placeholder="Interest" onChange={handleChange} /><br/>

//       <button style={{padding:"10px 20px", marginTop:"10px"}} onClick={handleSubmit}>
//         Submit
//       </button>
//     </div>
//   );
// }

// export default App;

import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [form, setForm] = useState({
    skills: "",
    interest: ""
  });

  const sendMessage = async () => {
    if (!message) return;

    const userMsg = { sender: "user", text: message };
    setChat([...chat, userMsg]);

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: message,
      });

      const botMsg = { sender: "bot", text: res.data.reply };
      setChat(prev => [...prev, botMsg]);

    } catch (error) {
      console.log(error);
    }

    setMessage("");
  };


  const getRecommendation = async () => {
    const res = await axios.post("http://localhost:5000/predict", {
      skills: form.skills.toLowerCase(),
      interest: form.interest.toLowerCase()
    });

    alert("Recommended Role: " + res.data.role);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>NayePankh AI Chatbot 🤖</h1>

      <div style={{
        border: "1px solid #ccc",
        height: "300px",
        overflowY: "scroll",
        padding: "10px",
        marginBottom: "10px"
      }}>
        {chat.map((msg, index) => (
          <div key={index} style={{
            textAlign: msg.sender === "user" ? "right" : "left"
          }}>
            <p><b>{msg.sender}:</b> {msg.text}</p>
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
        style={{ width: "70%", padding: "10px" }}
      />

      <button onClick={sendMessage} style={{ padding: "10px" }}>
        Send
      </button>

      <h3>Get Volunteer Recommendation 🎯</h3>

      <input
        placeholder="Enter skills (teaching / tech / social)"
        onChange={(e) => setForm({ ...form, skills: e.target.value })}
      />

      <br /><br />

      <input
        placeholder="Enter interest (education / web / community)"
        onChange={(e) => setForm({ ...form, interest: e.target.value })}
      />

      <br /><br />

      <button onClick={getRecommendation}>
        Get Recommendation
    </button>
    </div>
  );
}

export default App;