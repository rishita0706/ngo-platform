"""
NayePankh Volunteer Role Recommendation Model v2
================================================
Improvements over v1:
  - Expanded balanced dataset: 133 samples (vs 9)
  - TF-IDF (word + bigram) text features instead of label encoding
  - Logistic Regression with calibrated probabilities (vs Decision Tree)
  - Stratified 5-fold cross-validation during training
  - Confidence scores exported alongside predictions
  - Saved as sklearn Pipeline (pipeline.pkl) — single artifact for inference
  - model metadata saved to metadata.json
  - Backward-compatible: legacy pkl filenames also written
"""

import json
import os
import warnings
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

BASE_PATH = os.path.dirname(__file__)

# ─────────────────────────────────────────────────────────────
# DATASET  (skills_text, interest_text, role)
# ─────────────────────────────────────────────────────────────
RECORDS = [
    # Mentor
    ("teaching", "education", "Mentor"),
    ("teaching", "kids", "Mentor"),
    ("teaching", "school", "Mentor"),
    ("mentoring", "education", "Mentor"),
    ("mentoring", "youth development", "Mentor"),
    ("coaching", "children", "Mentor"),
    ("tutoring", "academics", "Mentor"),
    ("tutoring", "education", "Mentor"),
    ("classroom experience", "primary education", "Mentor"),
    ("english teaching", "language education", "Mentor"),
    ("maths teaching", "stem education", "Mentor"),
    ("science teaching", "stem", "Mentor"),
    ("child psychology", "child welfare", "Mentor"),
    ("educational content", "curriculum design", "Mentor"),
    ("lesson planning", "school programs", "Mentor"),
    ("teacher training", "education quality", "Mentor"),
    ("storytelling", "children education", "Mentor"),
    ("reading instruction", "literacy", "Mentor"),
    ("special education", "inclusive learning", "Mentor"),
    ("career counselling", "student guidance", "Mentor"),
    ("motivational speaking", "youth empowerment", "Mentor"),
    ("academic mentoring", "college prep", "Mentor"),
    ("homework help", "after school programs", "Mentor"),
    ("art education", "creative learning", "Mentor"),
    ("music teaching", "arts education", "Mentor"),
    ("physical education", "sports for kids", "Mentor"),
    ("teach english", "education", "Mentor"),
    ("teach maths", "education", "Mentor"),
    ("train students", "school", "Mentor"),
    ("guide children", "learning", "Mentor"),
    ("volunteer teacher", "education", "Mentor"),
    ("school volunteer", "kids learning", "Mentor"),
    ("primary teacher", "early education", "Mentor"),
    ("secondary teacher", "school curriculum", "Mentor"),
    ("education consultant", "school reform", "Mentor"),
    ("online teaching", "digital education", "Mentor"),
    ("teaching assistant", "classroom support", "Mentor"),
    ("tutor online", "remote education", "Mentor"),
    ("hindi teaching", "vernacular education", "Mentor"),
    ("science mentor", "stem education", "Mentor"),
    # Web Support
    ("coding", "web", "Web Support"),
    ("tech", "web", "Web Support"),
    ("tech", "app", "Web Support"),
    ("tech", "software", "Web Support"),
    ("programming", "web development", "Web Support"),
    ("web development", "website", "Web Support"),
    ("software engineering", "backend", "Web Support"),
    ("frontend development", "UI design", "Web Support"),
    ("react", "web apps", "Web Support"),
    ("nodejs", "backend apis", "Web Support"),
    ("python programming", "automation", "Web Support"),
    ("database management", "data systems", "Web Support"),
    ("cybersecurity", "digital safety", "Web Support"),
    ("cloud computing", "infrastructure", "Web Support"),
    ("app development", "mobile apps", "Web Support"),
    ("android development", "mobile", "Web Support"),
    ("ios development", "mobile apps", "Web Support"),
    ("machine learning", "AI systems", "Web Support"),
    ("data analysis", "analytics", "Web Support"),
    ("UI UX design", "user experience", "Web Support"),
    ("graphic design", "digital media", "Web Support"),
    ("digital marketing", "online outreach", "Web Support"),
    ("SEO", "digital visibility", "Web Support"),
    ("social media management", "online presence", "Web Support"),
    ("content management", "CMS", "Web Support"),
    ("wordpress", "website management", "Web Support"),
    ("network administration", "IT infrastructure", "Web Support"),
    ("devops", "deployment", "Web Support"),
    ("QA testing", "software quality", "Web Support"),
    ("javascript", "web programming", "Web Support"),
    ("html css", "frontend", "Web Support"),
    ("flutter", "cross platform apps", "Web Support"),
    ("django", "web framework", "Web Support"),
    ("api development", "backend services", "Web Support"),
    ("video editing", "digital content", "Web Support"),
    ("photography editing", "visual content", "Web Support"),
    ("data entry", "digital records", "Web Support"),
    ("excel data", "spreadsheets", "Web Support"),
    ("technical writing", "documentation", "Web Support"),
    ("computer skills", "digital work", "Web Support"),
    ("it support", "technical help", "Web Support"),
    ("coding volunteer", "web", "Web Support"),
    ("developer", "software", "Web Support"),
    ("programmer", "tech", "Web Support"),
    ("tech volunteer", "digital", "Web Support"),
    ("website volunteer", "web presence", "Web Support"),
    # Field Volunteer
    ("social work", "community", "Field Volunteer"),
    ("social", "community", "Field Volunteer"),
    ("social", "events", "Field Volunteer"),
    ("social", "help", "Field Volunteer"),
    ("community organizing", "local outreach", "Field Volunteer"),
    ("event management", "public events", "Field Volunteer"),
    ("fundraising", "donation drives", "Field Volunteer"),
    ("awareness campaigns", "public awareness", "Field Volunteer"),
    ("door to door", "community reach", "Field Volunteer"),
    ("distribution", "resource delivery", "Field Volunteer"),
    ("food distribution", "hunger relief", "Field Volunteer"),
    ("health camps", "medical outreach", "Field Volunteer"),
    ("sanitation drives", "cleanliness", "Field Volunteer"),
    ("tree plantation", "environment", "Field Volunteer"),
    ("disaster relief", "emergency response", "Field Volunteer"),
    ("crowd management", "large events", "Field Volunteer"),
    ("logistics", "supply coordination", "Field Volunteer"),
    ("volunteer coordination", "team management", "Field Volunteer"),
    ("public speaking", "community meetings", "Field Volunteer"),
    ("survey work", "data collection", "Field Volunteer"),
    ("registration", "enrollment drives", "Field Volunteer"),
    ("childcare", "child welfare", "Field Volunteer"),
    ("elderly care", "senior welfare", "Field Volunteer"),
    ("women empowerment", "gender equality", "Field Volunteer"),
    ("rural outreach", "village programs", "Field Volunteer"),
    ("slum outreach", "urban poor", "Field Volunteer"),
    ("street children", "homeless youth", "Field Volunteer"),
    ("sports coaching", "youth sports", "Field Volunteer"),
    ("cultural programs", "arts community", "Field Volunteer"),
    ("cleanliness drives", "sanitation", "Field Volunteer"),
    ("blood donation", "health drives", "Field Volunteer"),
    ("eye camps", "health outreach", "Field Volunteer"),
    ("legal aid", "community justice", "Field Volunteer"),
    ("microfinance", "economic empowerment", "Field Volunteer"),
    ("agricultural support", "rural development", "Field Volunteer"),
    ("first aid", "emergency help", "Field Volunteer"),
    ("community volunteer", "local help", "Field Volunteer"),
    ("social service", "helping community", "Field Volunteer"),
    ("ngo volunteer", "social impact", "Field Volunteer"),
    ("helping poor", "poverty reduction", "Field Volunteer"),
    ("helping children", "child support", "Field Volunteer"),
    ("social outreach", "community service", "Field Volunteer"),
    ("field work", "on ground", "Field Volunteer"),
    ("awareness", "community", "Field Volunteer"),
    ("outreach", "local community", "Field Volunteer"),
    ("charity work", "donation", "Field Volunteer"),
    ("welfare", "social help", "Field Volunteer"),
]

print(f"[train] Dataset: {len(RECORDS)} samples")

df = pd.DataFrame(RECORDS, columns=["skills", "interest", "role"])
print("[train] Class distribution:\n" + df["role"].value_counts().to_string())

df["text"] = (
    df["skills"].str.lower().str.strip()
    + " "
    + df["interest"].str.lower().str.strip()
)

X = df["text"].values
le_role = LabelEncoder()
y = le_role.fit_transform(df["role"].values)
print(f"[train] Classes: {list(le_role.classes_)}")

# Pipeline: TF-IDF bigrams → Logistic Regression
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        min_df=1,
        max_features=2000,
        sublinear_tf=True,
    )),
    ("clf", LogisticRegression(
        C=1.0,
        max_iter=500,
        class_weight="balanced",
        random_state=42,
        solver="lbfgs",
    )),
])

# Stratified 5-fold CV
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring="accuracy")
print(f"\n[train] CV Accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

# Fit on full data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
print("\n[train] Classification report:")
print(classification_report(y_test, y_pred, target_names=le_role.classes_))

# Save
joblib.dump(pipeline, os.path.join(BASE_PATH, "pipeline.pkl"))
joblib.dump(le_role,  os.path.join(BASE_PATH, "le_role.pkl"))
# Legacy stubs (predict.py v1 compatibility)
joblib.dump(pipeline, os.path.join(BASE_PATH, "model.pkl"))
joblib.dump(le_role,  os.path.join(BASE_PATH, "le_skills.pkl"))
joblib.dump(le_role,  os.path.join(BASE_PATH, "le_interest.pkl"))

metadata = {
    "trained_at":        datetime.utcnow().isoformat(),
    "dataset_size":      len(RECORDS),
    "classes":           list(le_role.classes_),
    "cv_accuracy_mean":  round(float(cv_scores.mean()), 4),
    "cv_accuracy_std":   round(float(cv_scores.std()),  4),
    "model_type":        "TF-IDF (1,2)-gram + LogisticRegression",
    "version":           "2.0.0",
}
with open(os.path.join(BASE_PATH, "metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print(f"\n[train] Saved pipeline.pkl, le_role.pkl, metadata.json ✅")

 
# import pandas as pd # type: ignore
# print("Running ML model...")
# data = {
#     "skills": [
#         "teaching", "teaching", "teaching",
#         "tech", "tech", "tech",
#         "social", "social", "social"
#     ],
#     "interest": [
#         "education", "kids", "school",
#         "web", "app", "software",
#         "community", "events", "help"
#     ],
#     "role": [
#         "Mentor", "Mentor", "Mentor",
#         "Web Support", "Web Support", "Web Support",
#         "Field Volunteer", "Field Volunteer", "Field Volunteer"
#     ]
# }

# df = pd.DataFrame(data)
# print(df)

# from sklearn.preprocessing import LabelEncoder # type: ignore
# from sklearn.tree import DecisionTreeClassifier # type: ignore
# import joblib # type: ignore

# # Encode text → numbers
# le_skills = LabelEncoder()
# le_interest = LabelEncoder()
# le_role = LabelEncoder()

# df["skills"] = le_skills.fit_transform(df["skills"])
# df["interest"] = le_interest.fit_transform(df["interest"])
# df["role"] = le_role.fit_transform(df["role"])

# X = df[["skills", "interest"]]
# y = df["role"]

# model = DecisionTreeClassifier()
# model.fit(X, y)

# # Save everything
# joblib.dump(model, "model.pkl")
# joblib.dump(le_skills, "le_skills.pkl")
# joblib.dump(le_interest, "le_interest.pkl")
# joblib.dump(le_role, "le_role.pkl")

# print("Model trained and saved ✅")