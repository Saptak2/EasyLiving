
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
    if kmeans is None or scaler is None:
        raise HTTPException(status_code=503, detail="KMeans model not loaded")

    try:
        # 🔥 CREATE SAME SCORE (VERY IMPORTANT)
        sleep_n = data.sleep / data.user_sleep if data.user_sleep > 0 else 0
        screen_n = 1 - (data.screen / data.user_screen) if data.user_screen > 0 else 0
        exercise_n = data.exercise / data.user_exercise if data.user_exercise > 0 else 0
        activity_n = data.activity_duration / data.user_activity if data.user_activity > 0 else 0
       
        #expense_n = 1 - (data.expense / data.avg_expense)
        if data.avg_expense > 0:
            expense_n = 1 - (data.expense / data.avg_expense)
        else:
            expense_n = 0
        #activity_n = data.activity_count / 5


        score = (
            0.3 * sleep_n +
            0.2 * exercise_n +
            0.2 * activity_n +
            0.15 * screen_n +
            0.15 * expense_n
        )

        print("------ DEBUG ------")
        print("Expense (7 days):", data.expense)
        print("User avg expense:", data.avg_expense)
        print("Calculated expense_n:", expense_n)
        print("Final score:", score)
        print("-------------------")
        expense_scaled = data.expense / 1000

        features = np.array([[
            data.sleep,
            data.screen,
            data.exercise,
            expense_scaled,
            data.activity_duration
        ]])

        #features = features.astype(float)

        #features = np.array([[score]])
        scaled = scaler.transform(features)

        #weights = [4, 1, 3, 1, 2]
        #scaled = scaled * weights
        cluster = int(kmeans.predict(scaled)[0])

        # cluster-based recommendation
        if cluster == 0:
            suggestion = "Healthy lifestyle. Keep it up."
        elif cluster == 1:
            suggestion = "Moderate lifestyle. Improve daily habits."
        elif cluster == 2:
            suggestion = "Low lifestyle: poor routine detected."

        issues = []

        if data.sleep < 4:
            issues.append("⚠️ Low sleep")

        if data.exercise < data.user_exercise *0.7:
            issues.append("⚠️  Lower activity than your usual routine")

        if data.screen > data.user_screen:
            issues.append("⚠️ Higher screen time than your normal usage")

        if data.expense > data.avg_expense:
            issues.append("⚠️ High spending compared to your usual pattern")

        #if data.activity_count == 0:
         #   issues.append("⚠️ No daily activity")

        if data.activity_duration < 15:
            issues.append("⚠️ Very low activity duration")

        elif data.activity_duration > 30:
            issues.append("✅ Good physical activity level")

        # If no issues
        if len(issues) == 0:
            issues.append("✅ No major issues detected")

        
        return {
            "cluster": cluster,
            "lifestyle_score": round(float(score), 3),
            "lifestyle_recommendation": suggestion,
            "issues_detected": issues   # 🔥 NEW FIELD
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)