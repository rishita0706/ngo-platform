import pandas as pd # type: ignore
print("Running ML model...")
data = {
    "skills": [
        "teaching", "teaching", "teaching",
        "tech", "tech", "tech",
        "social", "social", "social"
    ],
    "interest": [
        "education", "kids", "school",
        "web", "app", "software",
        "community", "events", "help"
    ],
    "role": [
        "Mentor", "Mentor", "Mentor",
        "Web Support", "Web Support", "Web Support",
        "Field Volunteer", "Field Volunteer", "Field Volunteer"
    ]
}

df = pd.DataFrame(data)
print(df)

from sklearn.preprocessing import LabelEncoder # type: ignore
from sklearn.tree import DecisionTreeClassifier # type: ignore
import joblib # type: ignore

# Encode text → numbers
le_skills = LabelEncoder()
le_interest = LabelEncoder()
le_role = LabelEncoder()

df["skills"] = le_skills.fit_transform(df["skills"])
df["interest"] = le_interest.fit_transform(df["interest"])
df["role"] = le_role.fit_transform(df["role"])

X = df[["skills", "interest"]]
y = df["role"]

model = DecisionTreeClassifier()
model.fit(X, y)

# Save everything
joblib.dump(model, "model.pkl")
joblib.dump(le_skills, "le_skills.pkl")
joblib.dump(le_interest, "le_interest.pkl")
joblib.dump(le_role, "le_role.pkl")

print("Model trained and saved ✅")