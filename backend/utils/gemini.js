import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export const getGeminiResponse = async (prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        return response.text;

    } catch (error) {
        console.error("Gemini Error:", error);
        throw new Error("AI response failed");
    }
};