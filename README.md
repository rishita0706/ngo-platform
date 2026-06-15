<!-- <div align="center">

# 🕊️ NayePankh AI Platform

### *नए पंख — New Wings for every child*

**UP Government Registered · 80G Certified · 12A Certified**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.x-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) · [Architecture](#️-architecture) · [Installation](#-installation) · [API Docs](#-api-reference) · [ML Model](#-ml-model) · [Contributing](#-contributors)

</div>

--- -->

## 📌 Project Overview

NayePankh Foundation is a registered NGO in Uttar Pradesh, India, focused on free education, digital literacy, and community welfare for underprivileged children. This platform is the NGO's full-stack digital presence, combining:

- A **production-ready React frontend** with a custom design system — hero sections, animated impact stats, volunteer registration, donation flows, and an accessible chatbot widget
- A **Node.js/Express backend** with a modular route/middleware/utility architecture, MongoDB persistence, structured logging, and graceful error handling
- An **AI-powered volunteer chatbot** with a two-tier architecture: OpenAI GPT-3.5-turbo when available, falling back to an enhanced rule-based engine with session memory and contextual responses — zero downtime regardless of API status
- A **machine-learning role recommendation engine** that classifies volunteers into the best-fit role (Mentor / Web Support / Field Volunteer) using TF-IDF text features and Logistic Regression, achieving **86.5% cross-validated accuracy** with calibrated confidence scores

---

## ✨ Features

| Area | Feature |
|---|---|
| 🏠 **Home** | Full-viewport hero with animated orbs, intersection-observer count-up stats, programs grid, testimonials carousel, CTA banner |
| 📖 **About** | Mission/vision cards, interactive milestone timeline, values grid, government certification badges |
| 🤝 **Volunteer** | Role-chip shortcuts, validated registration form, duplicate-email detection, success state, DB persistence |
| 💛 **Donate** | Preset + custom amount selector, per-tier impact breakdown, FAQ accordion, trust strip |
| 🤖 **AI Chatbot** | Floating widget · Tabbed UI (Chat / Role Match) · Typing indicator · Auto-scroll · Enter-to-send · Session memory |
| 🎯 **Role Recommendation** | ML prediction with confidence score + per-class probabilities · Confidence-gated UI (≥75% to surface) |
| 📱 **Responsive** | Mobile-first · Hamburger drawer · All breakpoints (480 / 768 / 1024 px) |
| ♿ **Accessible** | ARIA labels, roles, live regions · Keyboard navigation · Visible focus rings · `prefers-reduced-motion` |
| 🔒 **Security** | Input sanitization before shell exec · Request validation layer · Duplicate-email guard · CORS configuration |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| React Router | v7 | Client-side routing |
| Axios | 1.x | HTTP requests to backend |
| Pure CSS | — | Custom design system (no UI library) |
| Google Fonts | — | Merriweather (display) + Plus Jakarta Sans (body) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | HTTP framework |
| Mongoose | 9 | MongoDB ODM |
| dotenv | 17 | Environment config |
| cors | 2.8 | Cross-origin requests |
| Node `https` | built-in | OpenAI calls (no SDK dependency) |

### ML / Python
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.9+ | ML runtime |
| scikit-learn | 1.x | TF-IDF + Logistic Regression pipeline |
| NLTK | 3.x | Text preprocessing utilities |
| joblib | 1.x | Model serialization |
| pandas / numpy | latest | Dataset handling during training |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Volunteer data (free M0 cluster works) |
| OpenAI API | GPT-3.5-turbo for chatbot (optional — has fallback) |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   React Frontend  :3000                         │
│                                                                 │
│  /           Home      Hero · Stats · Programs · Testimonials   │
│  /about      About     Timeline · Values · Certifications       │
│  /volunteer  Volunteer Role chips · Form → POST /volunteer      │
│  /donate     Donate    Amount selector · Impact · FAQ           │
│  [widget]    Chatbot   Chat tab → POST /chat                    │
│                        Role Match tab → POST /predict           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ axios (HTTP/JSON)
┌──────────────────────────▼──────────────────────────────────────┐
│                  Express Backend  :5000                         │
│                                                                 │
│  POST /chat ────► chatEngine.js                                 │
│                    ├─ Tier 1: OpenAI GPT-3.5-turbo             │
│                    │   (NGO system prompt, multi-turn context)  │
│                    └─ Tier 2: Rule-based engine                 │
│                        (session memory, 8 intent categories,    │
│                         random response pools, ML hint inject)  │
│                                                                 │
│  POST /predict ──► mlRunner.js ──► predict.py (child process)  │
│                                        ↓                        │
│                              pipeline.pkl (sklearn)             │
│                              → { role, confidence, all_scores } │
│                                                                 │
│  POST /volunteer ──► Mongoose ──► MongoDB Atlas                 │
│  GET  /volunteer ──► Mongoose ──► MongoDB Atlas (paginated)     │
│  GET  /health ──────────────────► { db, uptime }               │
└─────────────────────────────────────────────────────────────────┘
```

### Chatbot Fallback Chain

```
User message arrives at POST /chat
          │
          ▼
  OPENAI_API_KEY set and starts with "sk-"?
          │
     YES ─┤                      NO ─┐
          ▼                          │
  Call GPT-3.5-turbo                 │
  with NGO system prompt             │
  + last 4 turns as context          │
          │                          │
    Success ──► return reply         │
    (source: "openai")               │
          │                          │
    Error/timeout ──────────────────►│
    (quota, network, invalid key)    │
                                     ▼
                           Rule-based engine
                           ├─ Detect topic (8 categories)
                           ├─ Detect interest from text
                           ├─ Update session memory
                           ├─ Pick from response pool (random)
                           └─ (source: "local")
                                     │
                                     ▼
                       ML confidence check
                       (parallel call to predict.py)
                       confidence ≥ 0.75?
                           YES → append role hint to reply
                           NO  → reply as-is
```

### ML Inference Pipeline

```
User input: (skills_text, interest_text)
          │
          ▼
  enrich_text()  ←  keyword hint injection
  (expands partial/colloquial text to canonical category tokens)
          │
          ▼
  combined = skills_enriched + " " + interest_enriched
          │
          ▼
  TF-IDF Vectorizer
  (word + bigram, max 2000 features, sublinear_tf)
          │
          ▼
  Logistic Regression
  (C=1.0, balanced class weights, lbfgs solver)
          │
          ▼
  predict_proba() → [p_FieldVol, p_Mentor, p_WebSupport]
          │
          ▼
  { role, confidence, all_scores }  →  JSON stdout  →  Node.js
```

---

## 📁 Project Structure

```
ngo-platform/
│
├── frontend/                          # React application
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.css                  # Design system (CSS custom properties)
│       ├── App.css                    # Shell styles
│       ├── App.js                     # Router + layout wrapper
│       ├── index.js                   # React entry point
│       │
│       ├── components/
│       │   ├── Navbar.js              # Sticky header, mobile drawer, scroll shadow
│       │   ├── Navbar.css
│       │   ├── Footer.js              # 4-column grid, certification badges
│       │   ├── Footer.css
│       │   ├── Chatbot.js             # Floating widget, tabbed (Chat / Role Match)
│       │   └── Chatbot.css
│       │
│       └── pages/
│           ├── Home.js                # Hero, count-up stats, programs, CTA
│           ├── Home.css
│           ├── About.js               # Timeline, values, certs
│           ├── About.css
│           ├── Volunteer.js           # Role chips, validated form
│           ├── Volunteer.css
│           ├── Donate.js              # Amount selector, FAQ accordion
│           └── Donate.css
│
├── backend/                           # Node.js / Express API
│   ├── .env                           # Secrets (never commit)
│   ├── package.json
│   ├── server.js                      # App bootstrap, DB connect, route mount
│   │
│   ├── config/
│   │   └── index.js                   # Centralised env config + startup validation
│   │
│   ├── middleware/
│   │   └── errorHandler.js            # asyncWrap(), validate(), 4-arg error handler
│   │
│   ├── models/
│   │   └── Volunteer.js               # Mongoose schema (timestamps + email index)
│   │
│   ├── routes/
│   │   ├── chat.js                    # POST /chat + POST /predict (chat/predict)
│   │   └── volunteer.js               # POST /volunteer + GET /volunteer
│   │
│   └── utils/
│       ├── chatEngine.js              # Two-tier chat: OpenAI → rule-based fallback
│       ├── mlRunner.js                # Safe child_process wrapper for predict.py
│       └── logger.js                  # Leveled structured logger (error/warn/info/debug)
│
└── ml-model/                          # Python ML pipeline
    ├── model.py                       # Training script (run once or to retrain)
    ├── predict.py                     # Inference script (called per request by Node)
    ├── pipeline.pkl                   # Trained sklearn Pipeline (TF-IDF + LR)
    ├── le_role.pkl                    # LabelEncoder for class names
    └── metadata.json                  # Training run info and accuracy metrics
```

---

## 🚀 Installation

### Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Python | 3.9+ | `python3 --version` |
| pip | any | `pip --version` |
| Git | any | `git --version` |
| MongoDB Atlas account | free M0 | [mongodb.com](https://mongodb.com) |

### 1 — Clone

```bash
git clone https://github.com/your-username/ngo-platform.git
cd ngo-platform
```

### 2 — Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 3 — Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4 — Install Python ML dependencies

```bash
pip install scikit-learn nltk joblib pandas numpy
```

Download the NLTK tokenizer data (one-time):

```bash
python3 -c "
import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
print('NLTK data downloaded.')
"
```

---

## ⚙️ Configuration

Create the file `backend/.env` with the following keys:

```env
# ── Required ──────────────────────────────────────────────────────
# MongoDB Atlas connection string
# Get it from: Atlas dashboard → Connect → Drivers → Node.js
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# ── Optional: AI Chatbot ──────────────────────────────────────────
# If set and valid, the chatbot uses GPT-3.5-turbo.
# If missing, expired, or over quota → automatically uses the local
# rule-based engine. The app never crashes due to a missing key.
OPENAI_API_KEY=sk-proj-...

# ── Optional: Server ──────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# Controls console output level: error | warn | info | debug
LOG_LEVEL=info

# Lock CORS to your frontend origin in production
CORS_ORIGIN=http://localhost:3000
```

> **MongoDB Atlas free tier setup:**
> 1. Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com)
> 2. Create a free M0 cluster
> 3. Add a database user (username + password)
> 4. Allow network access from `0.0.0.0/0` (or your server IP)
> 5. Click **Connect → Drivers → Node.js** and copy the connection string
> 6. Replace `<password>` in the string with your actual password

> **OpenAI API key:**
> Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
> GPT-3.5-turbo costs ~$0.002/1K tokens. Leaving the key blank is fine — the
> local fallback engine handles all conversations without any external API.

---

## ▶️ Running the App

### Step 1 — Train the ML model *(first time only)*

```bash
cd ml-model
python3 model.py
```

Expected output:

```
[train] Dataset: 133 samples
[train] Class distribution:
role
Field Volunteer    47
Web Support        46
Mentor             40
[train] Classes: ['Field Volunteer', 'Mentor', 'Web Support']

[train] CV Accuracy: 0.865 ± 0.086
[train] Fold scores: [0.815, 0.741, 0.963, 0.846, 0.962]

[train] Classification report:
                 precision    recall  f1-score   support
Field Volunteer       1.00      1.00      1.00        47
         Mentor       1.00      1.00      1.00        40
    Web Support       1.00      1.00      1.00        46

[train] Saved pipeline.pkl, le_role.pkl, metadata.json ✅
```

The three generated files (`pipeline.pkl`, `le_role.pkl`, `metadata.json`) must be present for the backend to serve predictions.

### Step 2 — Start the backend

```bash
cd backend
npm start
```

Development mode (auto-restarts on file changes):

```bash
npm run dev
```

Expected startup log:

```
[2026-06-14T17:00:00.000Z] [INFO] [db] MongoDB connected
[2026-06-14T17:00:00.000Z] [INFO] [server] NayePankh backend v2 running on port 5000
[2026-06-14T17:00:00.000Z] [INFO] [server] OpenAI: configured ✅
[2026-06-14T17:00:00.000Z] [INFO] [server] ML model dir: /path/to/ml-model
```

### Step 3 — Start the frontend

```bash
cd frontend
npm start
```

Opens automatically at **[http://localhost:3000](http://localhost:3000)**.

### Step 4 — Verify everything works

| Check | URL | Expected |
|---|---|---|
| Backend health | `GET http://localhost:5000/health` | `{ "status": "ok", "db": "connected" }` |
| Chatbot | Widget in bottom-right corner | Sends/receives messages |
| Volunteer form | `/volunteer` page | Submits and shows success state |
| Role prediction | Chatbot → Role Match tab | Returns a role with confidence |

---

## 🧠 ML Model

### Problem Statement

Given a volunteer's free-text description of their **skills** and **area of interest**, predict the most suitable volunteer role.

### Classes

| Role | Representative Skills | Representative Interests |
|---|---|---|
| **Mentor** | teaching, tutoring, coaching, academic mentoring | education, kids, school, literacy |
| **Web Support** | coding, React, Node, design, data analysis | web, app, software, digital |
| **Field Volunteer** | social work, event management, outreach | community, rural, welfare, awareness |

### Model Comparison: v1 vs v2

| Aspect | v1 (Original) | v2 (Current) |
|---|---|---|
| Dataset size | 9 samples | **133 samples** |
| Feature engineering | `LabelEncoder` on 3 hard-coded buckets | **TF-IDF word + bigram** on raw text |
| Classifier | Decision Tree | **Logistic Regression** (calibrated probs) |
| Validation | None | **Stratified 5-fold CV** |
| CV Accuracy | ~100% (9-sample overfit) | **86.5% ± 8.6%** (real generalisation) |
| Output | Role string | **role + confidence + all_scores** |
| Free text input | ❌ Only 3 keywords worked | ✅ Handles natural language |
| Shell injection | ❌ Raw user input in exec | ✅ Sanitized via regex before exec |
| Error handling | ❌ Crashes on bad input | ✅ Structured JSON errors to stderr |

### Training

```bash
cd ml-model
python3 model.py
```

The script:
1. Builds a 133-sample balanced dataset covering all 3 classes
2. Constructs `text = skills + " " + interest` for each sample
3. Fits a `Pipeline([TfidfVectorizer(ngram_range=(1,2)), LogisticRegression()])` 
4. Evaluates with Stratified 5-fold cross-validation
5. Fits the final model on all data
6. Saves `pipeline.pkl`, `le_role.pkl`, and `metadata.json`

### Inference

The prediction script is called as a child process by Node.js:

```bash
python3 ml-model/predict.py "your skills here" "your interest here"
```

```bash
# Examples with real output:
python3 ml-model/predict.py "I love teaching children" "education"
# {"role": "Mentor", "confidence": 0.8753, "all_scores": {"Field Volunteer": 0.0679, "Mentor": 0.8753, "Web Support": 0.0568}}

python3 ml-model/predict.py "react developer" "web apps"
# {"role": "Web Support", "confidence": 0.7609, "all_scores": {"Field Volunteer": 0.1255, "Mentor": 0.1136, "Web Support": 0.7609}}

python3 ml-model/predict.py "social work" "community"
# {"role": "Field Volunteer", "confidence": 0.7887, "all_scores": {"Field Volunteer": 0.7887, "Mentor": 0.0946, "Web Support": 0.1167}}
```

### Confidence-Gated Display

The backend only surfaces a role suggestion to the user when `confidence ≥ 0.75`. Low-confidence predictions are silently withheld rather than shown as facts. This prevents the model from confidently misleading users when it's genuinely unsure.

```
confidence ≥ 0.75  →  role hint appended to chat reply
confidence < 0.75  →  chatbot reply returned as-is
```

---

## 📡 API Reference

Base URL: `http://localhost:5000`

All responses are JSON. All POST endpoints require `Content-Type: application/json`.

---

### `GET /`

Service identity check.

**Response `200`**
```json
{
  "status": "ok",
  "service": "NayePankh Backend",
  "version": "2.0.0",
  "time": "2026-06-14T17:00:00.000Z"
}
```

---

### `GET /health`

Database connectivity and process uptime.

**Response `200`**
```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 142
}
```

`db` values: `"connected"` · `"connecting"` · `"disconnected"`

---

### `POST /volunteer`

Register a new volunteer. Saves to MongoDB. Prevents duplicate emails.

**Request body**
```json
{
  "name":     "Priya Sharma",
  "email":    "priya@example.com",
  "skills":   "teaching, child psychology",
  "interest": "education, kids"
}
```

| Field | Type | Required | Max length |
|---|---|---|---|
| `name` | string | ✅ | 100 |
| `email` | string | ✅ | 200 |
| `skills` | string | ✅ | 300 |
| `interest` | string | ✅ | 300 |

**Success `201`**
```json
{
  "success": true,
  "message": "Volunteer registered successfully! We'll be in touch soon. 🎉",
  "id": "6847abc123def456"
}
```

**Validation error `400`**
```json
{
  "success": false,
  "errors": ["name is required", "email is required"]
}
```

**Duplicate email `409`**
```json
{
  "success": false,
  "error": "A volunteer with this email already exists."
}
```

---

### `GET /volunteer`

List all registered volunteers. Paginated.

**Query parameters**

| Param | Default | Max | Description |
|---|---|---|---|
| `page` | `1` | — | Page number |
| `limit` | `50` | `100` | Records per page |

**Response `200`**
```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "_id": "6847abc123def456",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "skills": "teaching, child psychology",
      "interest": "education, kids",
      "createdAt": "2026-06-14T17:00:00.000Z",
      "updatedAt": "2026-06-14T17:00:00.000Z"
    }
  ]
}
```

---

### `POST /chat`

Send a message to the NayePankh AI chatbot.

**Request body**
```json
{
  "message": "I love coding and want to volunteer",
  "sessionId": "user-abc-123"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `message` | string | ✅ | Max 1000 chars |
| `sessionId` | string | ❌ | Used for session memory. Defaults to `"default"` |

**Response `200`**
```json
{
  "success": true,
  "reply": "Awesome — we love having developers! 🚀 As a Web Support volunteer, you could help manage our platforms, build features, or teach digital literacy to youth.\n\n🎯 Based on your message, you might be a great **Web Support** (80% match)!",
  "source": "local"
}
```

| `source` | Meaning |
|---|---|
| `"openai"` | Reply from GPT-3.5-turbo |
| `"local"` | Reply from rule-based fallback engine |

The ML role hint (the line starting with 🎯) only appears when:
- `source` is `"local"` AND
- ML confidence for the detected role is ≥ 75%

**Validation error `400`**
```json
{
  "success": false,
  "errors": ["message is required"]
}
```

---

### `POST /predict`

Get an ML-powered volunteer role recommendation. Used by the chatbot's "Role Match" tab.

**Request body**
```json
{
  "skills": "teaching and child psychology",
  "interest": "education and literacy"
}
```

| Field | Type | Required | Max length |
|---|---|---|---|
| `skills` | string | ✅ | 300 |
| `interest` | string | ✅ | 300 |

**Success `200`**
```json
{
  "success": true,
  "role": "Mentor",
  "confidence": 0.8753,
  "all_scores": {
    "Field Volunteer": 0.0679,
    "Mentor": 0.8753,
    "Web Support": 0.0568
  }
}
```

`confidence` is a float `0.0–1.0`. `all_scores` gives the probability breakdown across all three classes (always sums to ~1.0).

**ML error `500`**
```json
{
  "success": false,
  "error": "Role prediction failed — please try again."
}
```

---

### Error response format

All error responses follow this envelope:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Validation errors use `"errors"` (array) instead of `"error"` (string).

---

## 📸 Screenshots

> Place screenshots in `docs/screenshots/` and update the paths below.

| Page / Feature | Screenshot |
|---|---|
| Home — Hero section | `docs/screenshots/01-home-hero.png` |
| Home — Animated stats | `docs/screenshots/02-home-stats.png` |
| Home — Programs grid | `docs/screenshots/03-home-programs.png` |
| About — Milestone timeline | `docs/screenshots/04-about-timeline.png` |
| Volunteer — Registration form | `docs/screenshots/05-volunteer-form.png` |
| Volunteer — Success state | `docs/screenshots/06-volunteer-success.png` |
| Donate — Amount selector | `docs/screenshots/07-donate-widget.png` |
| Chatbot — Chat tab | `docs/screenshots/08-chatbot-chat.png` |
| Chatbot — Role Match tab | `docs/screenshots/09-chatbot-recommend.png` |
| Mobile — Hamburger menu | `docs/screenshots/10-mobile-nav.png` |

---

## 🔮 Future Improvements

### High Priority

| # | Improvement | Rationale |
|---|---|---|
| 1 | **Replace `child_process.exec` with a persistent FastAPI microservice** | Current approach spawns a new Python process per request (~200ms cold start). A persistent HTTP service (e.g. FastAPI on port 5001) would respond in <10ms and support concurrent requests properly. |
| 2 | **JWT authentication for admin routes** | `GET /volunteer` is currently open to anyone. Should be gated behind an admin token. |
| 3 | **Rate limiting on `/chat` and `/predict`** | Add `express-rate-limit` to prevent abuse and protect OpenAI quota. |

### Medium Priority

| # | Improvement | Rationale |
|---|---|---|
| 4 | **Collect and retrain on real volunteer data** | The current model was trained on synthetic data. Pseudolabeled real registrations would dramatically improve accuracy for edge-case inputs. |
| 5 | **Admin dashboard** | A simple `/admin` page to view, filter, export, and email volunteers. |
| 6 | **Razorpay / UPI donation integration** | Replace the external redirect with an in-app payment flow with 80G receipt generation. |
| 7 | **Email confirmation on registration** | Send a welcome email via Nodemailer when a volunteer registers. |

### Lower Priority

| # | Improvement | Rationale |
|---|---|---|
| 8 | **Hindi / Hinglish chatbot support** | A significant portion of the NGO's audience is more comfortable in Hindi. |
| 9 | **Docker Compose setup** | `docker compose up` to start frontend + backend + ML service in one command. |
| 10 | **Unit and integration tests** | Jest for backend routes, Pytest for ML pipeline, React Testing Library for UI. |
| 11 | **Persistent chat sessions via Redis** | Current session memory lives in-process and resets on server restart. Redis would survive restarts and support horizontal scaling. |

---

## 🐛 Known Issues

| Issue | Workaround |
|---|---|
| `sessionId` is not authenticated — any client can impersonate another session | Use random UUIDs on the frontend (already the default behaviour) |
| ML script cold start adds ~200ms on first prediction after server restart | Predicted artifacts stay hot after first call; acceptable for current scale |
| OpenAI key with insufficient credits causes a logged warning but no user-visible error | The rule-based fallback is seamless — users are unaffected |
| `GET /volunteer` has no authentication | Do not expose the backend port publicly until auth is added |

---

## 👥 Contributors

| Name | Role | GitHub |
|---|---|---|
| Your Name | Full Stack Developer & ML Engineer | [@your-username](https://github.com/your-username) |
| NayePankh Foundation | Domain Expertise & Mission Direction | — |

**Want to contribute?**

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

For bugs, feature requests, or questions — open an [issue](https://github.com/your-username/ngo-platform/issues).

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 NayePankh Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

Made with ❤️ in India to give every child **नए पंख — New Wings** 🕊️

[nayepankh.com](https://nayepankh.com) · [nayepankh@gmail.com](mailto:nayepankh@gmail.com)

</div>