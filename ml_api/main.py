
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

        # Generate recommendations
        if mood.lower() == "happy":
            all_recs = [
            "🎉 Keep doing what makes you happy!",
            "💪 Stay active and share positivity with others.",
            "🌿 Journal your positive thoughts daily.",
            "😊 Help someone today.",
            "🎯 Set a small goal and achieve it.",
            "📸 Capture a happy moment today."
            ]

            recs = random.sample(all_recs, 3)
        elif mood.lower() == "neutral":
            all_recs = [
            "🌞 Keep a steady routine of sleep and exercise.",
            "📚 Try mindfulness or a hobby you enjoy.",
            "☕ Watch caffeine and screen time balance.",
            "🚶 Take a short walk to refresh your mind.",
            "🎧 Listen to something relaxing.",
            "🧘 Practice light stretching."
            ]

            recs = random.sample(all_recs, 3)
        elif mood.lower() == "sad":
            all_recs = [
                "💖 Go for a relaxing walk or call a friend.",
                "🧘 Try 10 mins of meditation or deep breathing.",
                "🌿 Track habits regularly — small steps matter.",
                "📞 Talk to someone you trust.",
                "🎵 Listen to calming music.",
                "🚶 Take a short walk outside.",
                "📝 Write down your feelings in a journal."
            ]

            recs = random.sample(all_recs, 3)
        elif mood.lower() == "stressed":
            all_recs = [
                "😌 Take short breaks to relax your mind.",
                "🎧 Listen to calming music or nature sounds.",
                "🕯️ Try gentle yoga or a warm bath before bed.",
                "🌿 Practice deep breathing for 5 minutes.",
                "📵 Reduce screen time for a while.",
                "☕ Avoid too much caffeine today."
            ]

            recs = random.sample(all_recs, 3)
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
