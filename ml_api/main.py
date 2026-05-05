
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import random


app = FastAPI(
    title="EasyLiving ML API",
    version="1.0",
    description="Predicts user mood based on numeric and text inputs."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


try:
    mood_model = joblib.load("models/final_mood_model.pkl")
    print("✅ Mood model loaded successfully")
except Exception as e:
    print("❌ Error loading mood model:", e)
    mood_model = None

try:
    kmeans = joblib.load("models/kmeans_model.pkl")
    scaler = joblib.load("models/kmeans_scaler.pkl")
    print("✅ KMeans model loaded")
except Exception as e:
    print("❌ Error loading KMeans:", e)
    kmeans = None
    scaler = None

class MoodInput(BaseModel):
    sleepHours: float
    screenTimeHours: float
    exerciseMinutes: float
    caffeineMg: float
    textInput: str

class RecommendationInput(BaseModel):
    sleep: float
    screen: float
    exercise: float
    expense: float
    activity_duration: float
    avg_expense: float
    user_sleep: float
    user_exercise: float   # ✅ NEW
    user_screen: float     # ✅ NEW
    user_activity: float

@app.get("/")
def home():
    return {"message": "🌿 EasyLiving ML API is running successfully!"}



@app.post("/predict/mood")
def predict_mood(data: MoodInput):
    if mood_model is None:
        raise HTTPException(status_code=503, detail="Mood model not loaded")

    try:
        text = data.textInput.lower()

        # 🔥 handle negation
        if "not" in text:
            text = text.replace("not good", "bad")
            text = text.replace("not happy", "sad")
            text = text.replace("not feeling good", "sad")

        df = pd.DataFrame([{
            "sleep_hours": data.sleepHours,
            "screen_time": data.screenTimeHours,
            "exercise_minutes": data.exerciseMinutes,
            "caffeine_mg": data.caffeineMg,
            "text_input": text
        }])


        prediction = mood_model.predict(df)[0]
        probs = mood_model.predict_proba(df)
        confidence = float(np.max(probs))

        mood = str(prediction).title()  # e.g., Happy, Neutral, Sad, Stressed

        return {
            "predicted_mood": mood,
            "confidence": round(confidence, 3)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

@app.post("/recommend")
def recommend(data: RecommendationInput):

    import numpy as np

    # ===============================
    # 🔥 SAFE NORMALIZATION
    # ===============================

    sleep_n = min(data.sleep / (data.user_sleep + 1), 1)

    screen_n = max(0, 1 - (data.screen / (data.user_screen + 1)))

    exercise_n = min(data.exercise / (data.user_exercise + 1), 1)

    activity_n = min(data.activity_duration / (data.user_activity + 1), 1)

    expense_n = max(0, 1 - (data.expense / (data.avg_expense + 1)))

    # ===============================
    # 🔥 LIFESTYLE SCORE (REALISTIC)
    # ===============================

    score = (
        0.35 * sleep_n +
        0.25 * exercise_n +
        0.15 * activity_n +
        0.15 * screen_n +
        0.10 * expense_n
    )

    # ===============================
    # 🔥 HUMAN-LIKE RECOMMENDATION
    # ===============================

    if score > 0.75:
        suggestion = "Great lifestyle! You are maintaining healthy habits. Keep it up and stay consistent."
    elif score > 0.5:
        suggestion = "Your lifestyle is moderate. You are doing okay, but small improvements in daily habits can make it better."
    else:
        suggestion = "Your lifestyle needs improvement. Try focusing on sleep, physical activity, and reducing screen time."

    # ===============================
    # 🔥 ISSUE DETECTION (REALISTIC)
    # ===============================

    issues = []

    if data.sleep < 5:
        issues.append("⚠️ You are not getting enough sleep")

    if data.exercise < data.user_exercise * 0.7:
        issues.append("⚠️ You are less active than your usual routine")

    if data.screen > data.user_screen:
        issues.append("⚠️ Your screen time is higher than usual")

    if data.expense > data.avg_expense:
        issues.append("⚠️ Your spending is higher than your average")

    if data.activity_duration < 15:
        issues.append("⚠️ Very low physical activity today")

    elif data.activity_duration > 30:
        issues.append("✅ Good physical activity today")

    # ===============================
    # 🔥 DEFAULT MESSAGE
    # ===============================

    if not issues:
        issues.append("✅ Your habits look balanced today")

    # ===============================
    # 🔥 FINAL RESPONSE
    # ===============================

    return {
        "lifestyle_score": round(float(score), 2),
        "lifestyle_recommendation": suggestion,
        "issues_detected": issues
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)