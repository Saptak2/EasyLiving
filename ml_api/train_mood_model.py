

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score


os.makedirs("models", exist_ok=True)


df_num = pd.read_csv("data/moodify_data.csv")  # numeric + mood label
df_txt = pd.read_csv("data/training.csv")      # text + label


label_map = {
    0: "Sad",
    1: "Happy",
    2: "Happy",
    3: "Stressed",
    4: "Stressed",
    5: "Neutral"
}
df_txt["mood"] = df_txt["label"].map(label_map)
df_txt = df_txt.rename(columns={"text": "text_input"})[["text_input", "mood"]]


df_num["mood"] = df_num["mood"].str.title()
df_num["text_input"] = ""


for col in ["sleep_hours", "screen_time", "exercise_minutes", "caffeine_mg"]:
    df_txt[col] = np.nan

df_num = df_num[["sleep_hours", "screen_time", "exercise_minutes", "caffeine_mg", "text_input", "mood"]]
df_txt = df_txt[["sleep_hours", "screen_time", "exercise_minutes", "caffeine_mg", "text_input", "mood"]]

df = pd.concat([df_num, df_txt], ignore_index=True)

print(f"✅ Combined dataset shape: {df.shape}")
print(df["mood"].value_counts())


numeric_features = ["sleep_hours", "screen_time", "exercise_minutes", "caffeine_mg"]
text_feature = "text_input"
target = "mood"

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

text_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(min_df=2, ngram_range=(1, 2)))
])

preprocessor = ColumnTransformer([
    ("num", numeric_pipeline, numeric_features),
    ("txt", text_pipeline, text_feature)
])

clf = LogisticRegression(max_iter=1000, solver="saga", class_weight="balanced")

pipe = Pipeline([
    ("preprocess", preprocessor),
    ("model", clf)
])


X = df[numeric_features + [text_feature]]
y = df[target]
X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)

pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)

print("\n🎯 Accuracy: {:.2f}%".format(accuracy_score(y_test, y_pred) * 100))
print(classification_report(y_test, y_pred, zero_division=0))


joblib.dump(pipe, "models/final_mood_model.pkl")
print("✅ Model saved at models/final_mood_model.pkl")
