
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np


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


class MoodInput(BaseModel):
    sleepHours: float
    screenTimeHours: float
    exerciseMinutes: float
    caffeineMg: float
    textInput: str



@app.get("/")
def home():
    return {"message": "🌿 EasyLiving ML API is running successfully!"}



@app.post("/predict/mood")
def predict_mood(data: MoodInput):
    if mood_model is None:
        raise HTTPException(status_code=503, detail="Mood model not loaded")

    try:

        df = pd.DataFrame([{
            "sleep_hours": data.sleepHours,
            "screen_time": data.screenTimeHours,
            "exercise_minutes": data.exerciseMinutes,
            "caffeine_mg": data.caffeineMg,
            "text_input": data.textInput
        }])


        prediction = mood_model.predict(df)[0]
        probs = mood_model.predict_proba(df)
        confidence = float(np.max(probs))

        mood = str(prediction).title()  # e.g., Happy, Neutral, Sad, Stressed

        # Generate recommendations
        if mood.lower() == "happy":
            recs = [
                "🎉 Keep doing what makes you happy!",
                "💪 Stay active and share positivity with others.",
                "🌿 Journal your positive thoughts daily."
            ]
        elif mood.lower() == "neutral":
            recs = [
                "🌞 Keep a steady routine of sleep and exercise.",
                "📚 Try mindfulness or a hobby you enjoy.",
                "☕ Watch caffeine and screen time balance."
            ]
        elif mood.lower() == "sad":
            recs = [
                "💖 Go for a relaxing walk or call a friend.",
                "🧘 Try 10 mins of meditation or deep breathing.",
                "🌿 Track habits regularly — small steps matter."
            ]
        elif mood.lower() == "stressed":
            recs = [
                "😌 Take short breaks to relax your mind.",
                "🎧 Listen to calming music or nature sounds.",
                "🕯️ Try gentle yoga or a warm bath before bed."
            ]
        else:
            recs = ["🌈 Stay mindful and keep tracking your moods daily."]

        return {
            "predicted_mood": mood,
            "confidence": round(confidence, 3),
            "recommendations": recs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
