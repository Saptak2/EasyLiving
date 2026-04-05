import MoodLog from "../models/MoodLog.js";

export const checkSadPattern = async (userId, days) => {
    const logs = await MoodLog.find({ userId })
        .sort({ date: -1 })
        .limit(days);

    if (logs.length < days) return false;

    return logs.every(log => log.predictedMood === "Sad");
};