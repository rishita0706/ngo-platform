import joblib # type: ignore
import sys
import os

import nltk # type: ignore
nltk.download('punkt')

base_path = os.path.dirname(__file__)

model = joblib.load(os.path.join(base_path, "model.pkl"))
le_skills = joblib.load(os.path.join(base_path, "le_skills.pkl"))
le_interest = joblib.load(os.path.join(base_path, "le_interest.pkl"))
le_role = joblib.load(os.path.join(base_path, "le_role.pkl"))

from nltk.tokenize import word_tokenize # type: ignore

def extract_skill(text):
    tokens = word_tokenize(text.lower())

    if any(word in tokens for word in ["code", "coding", "developer", "programming"]):
        return "tech"
    elif any(word in tokens for word in ["teach", "teaching", "mentor"]):
        return "teaching"
    elif any(word in tokens for word in ["social", "help", "community"]):
        return "social"
    
    return "social"  # default

# Get input from Node
skills_input = sys.argv[1]
interest_input = sys.argv[2]

skills = extract_skill(skills_input)

def extract_interest(text, skills):
    text = text.lower()

    score = {
        "web": 0,
        "app": 0,
        "software": 0,
        "education": 0,
        "community": 0
    }

    if "web" in text: score["web"] += 1
    if "app" in text: score["app"] += 1
    if "software" in text: score["software"] += 1
    if "education" in text or "teach" in text: score["education"] += 1
    if "community" in text or "social" in text or "help" in text: score["community"] += 1

    best = max(score, key=score.get)

    if score[best] == 0:
        # fallback
        if skills == "tech":
            return "web"
        elif skills == "teaching":
            return "education"
        else:
            return "community"

    return best

interest = extract_interest(interest_input, skills)

# Encode input
skills_encoded = le_skills.transform([skills])[0]
interest_encoded = le_interest.transform([interest])[0]

# Predict
prediction = model.predict([[skills_encoded, interest_encoded]])
role = le_role.inverse_transform(prediction)[0]

print(role)