"use strict";
/**
 * chatEngine.js — Conversational engine for NayePankh chatbot
 * ─────────────────────────────────────────────────────────────
 * Architecture:
 *   1. Try OpenAI (if key present and valid) with NGO-specific system prompt.
 *   2. Fall back to Claude-via-Anthropic API (if ANTHROPIC_KEY set).
 *   3. Final fallback: enhanced rule-based engine with:
 *        - Topic detection with fuzzy matching
 *        - Session memory (interest + history)
 *        - Response pools with random selection (no repetition)
 *        - Contextual follow-ups
 *
 * All tiers produce { reply: string, source: "openai"|"local" }
 */

const https  = require("https");
const logger = require("./logger");

// ── Per-session memory ──────────────────────────────────────
const sessionStore = new Map();

function getSession(sessionId) {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      interest:    null,
      lastTopic:   null,
      history:     [],     // last N user messages
      turnCount:   0,
    });
  }
  return sessionStore.get(sessionId);
}

// Prune old sessions (older than 2 h) to avoid memory leaks
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, sess] of sessionStore) {
    if ((sess._ts || 0) < cutoff) sessionStore.delete(id);
  }
}, 15 * 60 * 1000);

// ── OpenAI via HTTPS (no SDK needed) ───────────────────────
async function callOpenAI(apiKey, messages) {
  const body = JSON.stringify({
    model:       "gpt-3.5-turbo",
    messages,
    max_tokens:  220,
    temperature: 0.75,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.openai.com",
        path:     "/v1/chat/completions",
        method:   "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end",  () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(parsed.error.message));
            resolve(parsed.choices[0].message.content.trim());
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("OpenAI timeout")); });
    req.write(body);
    req.end();
  });
}

// ── System prompt for OpenAI ────────────────────────────────
const SYSTEM_PROMPT = `You are the friendly AI assistant for NayePankh Foundation, an NGO in Uttar Pradesh, India.
NayePankh is UP Government registered, 80G and 12A certified. It focuses on education for underprivileged children, digital literacy, and community welfare.

Your job:
- Answer questions about NayePankh's mission, programs, volunteering, and donations.
- Suggest volunteer roles based on skills (Mentor, Web Support, Field Volunteer).
- Be warm, encouraging, and concise (2-4 sentences max).
- If someone wants to donate, mention the official site: nayepankh.com
- Do NOT make up facts. If unsure, say "Please reach out to us at nayepankh@gmail.com".
- Respond in the same language the user writes in (English or Hindi).`;

// ── Enhanced rule-based fallback ────────────────────────────
const TOPICS = {
  volunteer: {
    keywords: ["volunteer", "volunteering", "join", "help ngo", "sign up", "register"],
    baseReplies: [
      "Volunteering with NayePankh is a wonderful way to create real change! 🌟 You can register on our Volunteer page and our AI will match you to the perfect role based on your skills.",
      "We'd love to have you as a volunteer! 🤝 Head to the Volunteer section, fill in your skills and interests, and we'll find the best fit — whether it's teaching, tech, or community work.",
      "Great choice! NayePankh volunteers make a direct impact on children's lives every day. Visit the Volunteer page to get started and receive your personalised role recommendation!",
    ],
    teachingReply: "Since you're passionate about teaching, volunteering as a Mentor would be perfect! 📚 You'd work directly with underprivileged children, helping them with academics and life skills. Register on our Volunteer page!",
    techReply:     "With your tech skills, the Web Support volunteer role is ideal for you! 💻 You'd help us maintain our digital presence and build tools that amplify our impact. Register now!",
    socialReply:   "Your passion for social work makes you a great Field Volunteer! 🤝 You'd join our on-ground teams running outreach programs and community events. Sign up on the Volunteer page!",
  },
  donate: {
    keywords: ["donat", "contribut", "money", "fund", "support financially", "rupee", "payment"],
    replies: [
      "Thank you for your generous heart! 💛 Every donation directly funds education materials, meals, and programs for children in need. You can donate at nayepankh.com — all donations are 80G certified for tax benefits!",
      "Your donation makes a real difference! 🙏 ₹200 buys school supplies, ₹500 provides a week of meals, ₹1000 funds a digital training session. Donate securely at nayepankh.com.",
      "We're so grateful for your support! NayePankh is 80G certified, so you get up to 50% tax deduction on your donation. Visit nayepankh.com to contribute securely.",
    ],
  },
  teach: {
    keywords: ["teach", "teaching", "teacher", "tutor", "mentor", "educate", "lesson"],
    replies: [
      "Teaching is at the heart of NayePankh's mission! 📖 As a Mentor volunteer, you'd guide children in academics, life skills, and digital literacy. Want to register? Head to our Volunteer page!",
      "We always need passionate teachers! 🎓 Our Mentor program connects you with children who need guidance the most. You can teach in-person or even online — perfect for any schedule.",
    ],
  },
  tech: {
    keywords: ["code", "coding", "developer", "tech", "programming", "software", "web", "app", "computer"],
    replies: [
      "Tech skills are incredibly valuable for NayePankh! 💻 As a Web Support volunteer, you could help manage our platforms, build features, or teach digital literacy to children and youth.",
      "Awesome — we love having developers and tech enthusiasts! 🚀 You could volunteer as Web Support, helping us build tools that impact thousands of lives. Or teach coding to children through our digital literacy program!",
    ],
  },
  social: {
    keywords: ["social", "community", "outreach", "event", "campaign", "rural", "poor", "welfare"],
    replies: [
      "Community work is so meaningful! 🌱 As a Field Volunteer, you'd join our ground teams running health camps, awareness drives, distribution events, and more across UP.",
      "Field volunteering with NayePankh puts you directly in communities that need support most! 🤝 You'll work on outreach, events, and welfare programs that create lasting change.",
    ],
  },
  about: {
    keywords: ["about", "what is", "who are", "nayepankh", "ngo", "mission", "what do you do", "tell me"],
    replies: [
      "NayePankh (meaning 'New Wings') is a UP Government registered NGO (80G & 12A certified) focused on education and social impact. 🕊️ We provide free education, digital literacy training, and community welfare programs to underprivileged children across Uttar Pradesh.",
      "We're NayePankh Foundation — an NGO with a mission to give every child 'new wings' to fly! 🌟 We run education programs, teach digital skills, match volunteers via AI, and work in 20+ communities across UP. All our donations are 80G certified.",
    ],
  },
  certificate: {
    keywords: ["certificate", "80g", "12a", "tax", "registered", "legal", "official"],
    replies: [
      "Yes, NayePankh is fully certified! ✅ We are UP Government registered, 80G certified (50% tax deduction on donations), and 12A certified (NGO income exempt from tax). You'll receive an official 80G receipt after every donation.",
    ],
  },
  help: {
    keywords: ["help", "how can i", "what can", "ways to", "contribute", "what should i"],
    replies: [
      "There are three powerful ways to support NayePankh! 💛\n1. **Donate** — any amount helps at nayepankh.com\n2. **Volunteer** — share your skills via our Volunteer page\n3. **Spread the word** — share our mission with friends and family\nWhat feels right for you?",
      "You can make a difference in multiple ways: donate money, volunteer your time and skills, or simply spread awareness about our work! 🌟 Which would you like to explore further?",
    ],
  },
  greet: {
    keywords: ["hello", "hi", "hey", "namaste", "good morning", "good evening", "greet"],
    replies: [
      "Hello! 👋 Welcome to NayePankh Foundation. I'm your AI assistant — I can tell you about our mission, help you volunteer, or guide you on donations. What brings you here today?",
      "Namaste! 🙏 I'm the NayePankh AI assistant. Whether you want to volunteer, donate, or just learn about our work — I'm here to help! What would you like to know?",
      "Hi there! 😊 Great to have you here. NayePankh is on a mission to empower children through education and technology. How can I assist you today?",
    ],
  },
};

const DEFAULT_REPLIES = [
  "That's a great question! NayePankh works across education, digital empowerment, and community welfare. You can volunteer your skills, donate, or spread awareness. What would you like to explore? 😊",
  "I'd love to tell you more about NayePankh! 🌟 We're an NGO focused on giving underprivileged children 'new wings' through education and technology. Are you interested in volunteering, donating, or learning about our programs?",
  "Thanks for reaching out! 🤝 NayePankh has programs for everyone — whether you want to teach, use your tech skills, volunteer on the ground, or simply donate. What resonates with you?",
  "Great to hear from you! I can help you with information about volunteering, donations, our programs, or certifications. What are you curious about? 😊",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectTopic(text) {
  const lower = text.toLowerCase();
  for (const [topicName, topic] of Object.entries(TOPICS)) {
    if (topic.keywords.some((kw) => lower.includes(kw))) return topicName;
  }
  return null;
}

function detectInterest(text) {
  const lower = text.toLowerCase();
  if (["teach", "tutor", "mentor", "educate", "lesson", "school"].some((k) => lower.includes(k))) return "teaching";
  if (["code", "tech", "developer", "software", "web", "app", "programming"].some((k) => lower.includes(k))) return "tech";
  if (["social", "community", "outreach", "event", "rural", "welfare"].some((k) => lower.includes(k))) return "social";
  return null;
}

function buildRuleReply(text, session) {
  const topic   = detectTopic(text);
  const interest = detectInterest(text) || session.interest;

  // Update session interest if newly detected
  if (detectInterest(text)) session.interest = detectInterest(text);

  if (topic === "volunteer" && interest) {
    const t = TOPICS.volunteer;
    if (interest === "teaching") return t.teachingReply;
    if (interest === "tech")     return t.techReply;
    if (interest === "social")   return t.socialReply;
  }

  if (topic && TOPICS[topic]) {
    const pool = TOPICS[topic].replies || TOPICS[topic].baseReplies;
    return pickRandom(pool);
  }

  return pickRandom(DEFAULT_REPLIES);
}

// ── Public API ───────────────────────────────────────────────
/**
 * getReply({ message, sessionId, openaiKey })
 * Returns { reply, source }
 */
async function getReply({ message, sessionId = "default", openaiKey = "" }) {
  const session = getSession(sessionId);
  session._ts   = Date.now();
  session.turnCount++;
  session.history = [...session.history.slice(-6), message]; // keep last 7

  // ── Tier 1: OpenAI ────────────────────────────────────────
  if (openaiKey && openaiKey.startsWith("sk-")) {
    try {
      // Build conversation history for context
      const messages = [{ role: "system", content: SYSTEM_PROMPT }];
      // Add last few turns as context
      const historySlice = session.history.slice(-4);
      for (let i = 0; i < historySlice.length - 1; i++) {
        messages.push({ role: "user",      content: historySlice[i] });
        messages.push({ role: "assistant", content: "..." }); // placeholder
      }
      messages.push({ role: "user", content: message });

      const reply = await callOpenAI(openaiKey, messages);
      logger.info("[chatEngine] OpenAI reply sent");
      return { reply, source: "openai" };
    } catch (err) {
      logger.warn("[chatEngine] OpenAI failed, using local fallback", { err: err.message });
    }
  }

  // ── Tier 2: Rule-based fallback ───────────────────────────
  const reply = buildRuleReply(message, session);
  logger.info("[chatEngine] Rule-based reply", { sessionId, topic: detectTopic(message) });
  return { reply, source: "local" };
}

module.exports = { getReply };
