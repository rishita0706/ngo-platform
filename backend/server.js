const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
let userMemory = {};

const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send("Backend is running 🚀");
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

const Volunteer = require('./models/Volunteer');

// Save volunteer
app.post('/volunteer', async (req, res) => {
    try {
        console.log("Incoming Data:", req.body);

        const newVolunteer = new Volunteer(req.body);
        await newVolunteer.save();
        res.status(201).json({ message: "Volunteer saved" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/volunteer', async (req, res) => {
    const data = await Volunteer.find();
    res.json(data);
});

const { exec } = require("child_process");

app.post("/chat", (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  // 🎯 Always try ML first
  exec(`python ../ml-model/predict.py "${userMessage}" "${userMessage}"`, (error, stdout, stderr) => {

    if (!error && stdout) {
      const role = stdout.trim();

      // If ML gives meaningful role → use it
      if (role === "Mentor" || role === "Web Support" || role === "Field Volunteer") {
        return res.json({
          reply: `Based on what you said, I recommend: ${role} 🎯`
        });
      }
    }

    // 🧠 fallback chatbot (your old logic)
    const userMessage = req.body.message.toLowerCase();
    const userId = "defaultUser"; // simple for now

    if (!userMemory[userId]) {
        userMemory[userId] = {
        interest: "",
        history: []
        };
    }

    let reply = "";

    // Detect interest
    if (userMessage.includes("teach")) {
        userMemory[userId].interest = "teaching";
    }
    else if (userMessage.includes("tech")) {
        userMemory[userId].interest = "technical";
    }
    else if (userMessage.includes("social")) {
        userMemory[userId].interest = "social work";
    }

    // Save history
    userMemory[userId].history.push(userMessage);

    // Smart replies using memory
    if (userMessage.includes("volunteer")) {
        if (userMemory[userId].interest === "teaching") {
        reply = "Since you're interested in teaching, you can volunteer as a mentor for children.";
        } 
        else if (userMemory[userId].interest === "technical") {
        reply = "You can help us by managing our website or digital platforms.";
        } 
        else {
        reply = "You can volunteer in teaching, events, or NGO activities.";
        }
    } 
    else if (userMessage.includes("donate")) {
        reply = "You can donate via our official platform to support education initiatives.";
    } 
    else if (userMessage.includes("help")) {
        reply = "You can help by volunteering, donating, or spreading awareness.";
    } 
    else {
        reply = `Based on what you've shared, I suggest exploring volunteering opportunities. 
        You can help in teaching, technical support, or social activities. 
        Tell me more about what excites you!`;  
    }

    res.json({ reply });
  });
});

app.post("/predict", (req, res) => {
  const { skills, interest } = req.body;

    exec(`python ../ml-model/predict.py "${skills}" "${interest}"`, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return res.status(500).send("ML error");
    }

    res.json({ role: stdout.trim() });
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});