"""
NayePankh Volunteer Role Predictor v2
======================================
Usage (called by Node.js backend):
    python predict.py "<skills_text>" "<interest_text>"

Output (stdout, JSON):
    {"role": "Mentor", "confidence": 0.91, "all_scores": {...}}

Errors go to stderr so Node can distinguish them from valid output.
"""

import json
import os
import sys

import joblib

BASE_PATH = os.path.dirname(__file__)

# ── Load artifacts (cached at module level for fast repeated calls) ──
try:
    pipeline = joblib.load(os.path.join(BASE_PATH, "pipeline.pkl"))
    le_role  = joblib.load(os.path.join(BASE_PATH, "le_role.pkl"))
except FileNotFoundError:
    print(json.dumps({"error": "Model artifacts not found. Run model.py first."}))
    sys.exit(1)

# ── Keyword hints for pre-processing ──────────────────────────────
SKILL_HINTS = {
    "tech": ["code", "coding", "developer", "programming", "software",
             "web", "app", "react", "node", "python", "javascript",
             "html", "css", "database", "api", "devops", "flutter",
             "android", "ios", "machine learning", "ml", "ai",
             "data", "design", "ui", "ux", "digital"],
    "teaching": ["teach", "teaching", "teacher", "mentor", "tutor",
                 "educate", "education", "classroom", "lesson",
                 "coach", "instruct", "lecture", "guide students",
                 "school", "academic"],
    "social": ["social", "community", "help", "volunteer", "outreach",
               "event", "campaign", "awareness", "field", "welfare",
               "charity", "ngo", "rural", "poor", "donate drive"],
}

INTEREST_HINTS = {
    "web":       ["web", "website", "app", "software", "digital", "online", "tech"],
    "education": ["education", "teach", "kids", "children", "school",
                  "learning", "literacy", "academic", "student"],
    "community": ["community", "social", "help", "events", "welfare",
                  "outreach", "rural", "poor", "awareness", "field"],
}


def enrich_text(raw: str, hint_map: dict) -> str:
    """Append matched hint category tokens to improve TF-IDF coverage."""
    lower = raw.lower()
    enriched = lower
    for category, keywords in hint_map.items():
        if any(kw in lower for kw in keywords):
            enriched += f" {category}"
    return enriched.strip()


def predict(skills_raw: str, interest_raw: str) -> dict:
    """Return role prediction with confidence scores."""
    skills_text   = enrich_text(skills_raw,   SKILL_HINTS)
    interest_text = enrich_text(interest_raw, INTEREST_HINTS)
    combined      = f"{skills_text} {interest_text}"

    probs       = pipeline.predict_proba([combined])[0]
    class_idx   = probs.argmax()
    role        = le_role.inverse_transform([class_idx])[0]
    confidence  = float(round(probs[class_idx], 4))

    all_scores = {
        le_role.inverse_transform([i])[0]: float(round(p, 4))
        for i, p in enumerate(probs)
    }

    return {
        "role":       role,
        "confidence": confidence,
        "all_scores": all_scores,
    }


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: predict.py <skills> <interest>"}))
        sys.exit(1)

    skills_input   = sys.argv[1]
    interest_input = sys.argv[2]

    try:
        result = predict(skills_input, interest_input)
        # Node reads stdout — must be pure JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


# import joblib # type: ignore
# import sys
# import os

# import nltk # type: ignore
# nltk.download('punkt')

# base_path = os.path.dirname(__file__)

# model = joblib.load(os.path.join(base_path, "model.pkl"))
# le_skills = joblib.load(os.path.join(base_path, "le_skills.pkl"))
# le_interest = joblib.load(os.path.join(base_path, "le_interest.pkl"))
# le_role = joblib.load(os.path.join(base_path, "le_role.pkl"))

# from nltk.tokenize import word_tokenize # type: ignore

# def extract_skill(text):
#     tokens = word_tokenize(text.lower())

#     if any(word in tokens for word in ["code", "coding", "developer", "programming"]):
#         return "tech"
#     elif any(word in tokens for word in ["teach", "teaching", "mentor"]):
#         return "teaching"
#     elif any(word in tokens for word in ["social", "help", "community"]):
#         return "social"
    
#     return "social"  # default

# # Get input from Node
# skills_input = sys.argv[1]
# interest_input = sys.argv[2]

# skills = extract_skill(skills_input)

# def extract_interest(text, skills):
#     text = text.lower()

#     score = {
#         "web": 0,
#         "app": 0,
#         "software": 0,
#         "education": 0,
#         "community": 0
#     }

#     if "web" in text: score["web"] += 1
#     if "app" in text: score["app"] += 1
#     if "software" in text: score["software"] += 1
#     if "education" in text or "teach" in text: score["education"] += 1
#     if "community" in text or "social" in text or "help" in text: score["community"] += 1

#     best = max(score, key=score.get)

#     if score[best] == 0:
#         # fallback
#         if skills == "tech":
#             return "web"
#         elif skills == "teaching":
#             return "education"
#         else:
#             return "community"

#     return best

# interest = extract_interest(interest_input, skills)

# # Encode input
# skills_encoded = le_skills.transform([skills])[0]
# interest_encoded = le_interest.transform([interest])[0]

# # Predict
# prediction = model.predict([[skills_encoded, interest_encoded]])
# role = le_role.inverse_transform(prediction)[0]

# print(role)