import MoodLog from "../models/MoodLog.js";
import { getGeminiResponse } from "../utils/gemini.js";

export const chatWithAI = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        // 🔥 Get latest mood
        const latestLog = await MoodLog.findOne({ userId })
            .sort({ createdAt: -1 });

        const mood = latestLog?.predictedMood || "Neutral";

        // 🔥 Smart prompt
        const prompt = `
You are an AI companion for an elderly person.

User mood: ${mood}

Guidelines:
- Speak simply and kindly
- Also try to understand user message and reply accordingly
- Be supportive and calm
- give shorter replies and human like replies and match the mood and tone
- If mood is Sad → comfort and emotional support
- If mood is Stressed → suggest relaxation
- If Happy → encourage positivity
- Keep responses short and human-like
- As this is more for indians speak like an indian, and comfort like a real person,

User says: "${message}"

Reply:
`;

        const reply = await getGeminiResponse(prompt);

        res.json({ reply });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "AI error" });
    }
};