import axios from "axios";
import MoodLog from "../models/MoodLog.js";


const FASTAPI_URL = "http://127.0.0.1:8000/predict/mood";


export const predictAndSaveMood = async (req, res) => {
  try {
    const { sleepHours, screenTimeHours, exerciseMinutes, caffeineMg, textInput } = req.body;

    if (!sleepHours || !screenTimeHours || !exerciseMinutes || !caffeineMg) {
      return res.status(400).json({ error: "All numeric fields are required" });
    }

    const response = await axios.post(FASTAPI_URL, {
      sleepHours,
      screenTimeHours,
      exerciseMinutes,
      caffeineMg,
      textInput: textInput || "",
    });

    const predictedMood = response.data.predicted_mood || "Unknown";
    const confidence = response.data.confidence || 0;

    const newMoodLog = await MoodLog.create({
      userId: req.user._id,
      sleepHours,
      screenTimeHours,
      exerciseMinutes,
      caffeineMg,
      moodNote: textInput,
      predictedMood,
      modelConfidence: confidence,
    });

    res.status(201).json({
      message: "Mood log saved successfully",
      predictedMood,
      confidence,
      moodLog: newMoodLog,
    });
  } catch (error) {
    console.error("❌ Mood Prediction Error:", error.message);
    res.status(500).json({
      error: "Failed to predict mood",
      details: error.message,
    });
  }
};
