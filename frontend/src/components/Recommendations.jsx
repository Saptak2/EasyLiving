import React from "react";
import { Lightbulb } from "lucide-react";

export default function Recommendations({ recommendationData, predictedMood }) {

    if (!recommendationData) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-2">📊 Lifestyle Insights</h2>
                <p className="text-gray-500 text-sm">No insights available yet.</p>
            </div>
        );
    }

    const { lifestyle_score, lifestyle_recommendation, issues_detected } = recommendationData;

    // 🎨 Color based on score
    const getScoreColor = () => {
        if (lifestyle_score > 0.7) return "text-green-600";
        if (lifestyle_score > 0.4) return "text-orange-500";
        return "text-red-500";
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-1">📊 Lifestyle Insights</h2>
            <p className="text-sm text-gray-600 mb-3">
                Based on your recent habits and activities
            </p>

            <hr className="mb-4 text-gray-300" />

            {/* 🔹 Lifestyle Score */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800">Overall Score:</p>
                <p className={`text-xl font-bold ${getScoreColor()}`}>
                    {lifestyle_score}
                </p>
            </div>

            {/* 🔹 Recommendation */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-1">
                    💡 Recommendation:
                </p>
                <p className="text-sm text-gray-700">
                    {lifestyle_recommendation}
                </p>
            </div>

            {/* 🔹 Issues */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-800 mb-2">
                    ⚠️ Issues Detected:
                </p>

                <ul className="space-y-2 text-sm">
                    {issues_detected.map((issue, i) => (
                        <li key={i} className="flex items-start">
                            <Lightbulb className="h-4 w-4 mt-1 mr-2 
                                text-yellow-500" />
                            <span
                                className={
                                    issue.includes("⚠️")
                                        ? "text-red-600"
                                        : issue.includes("✅")
                                            ? "text-green-600"
                                            : "text-gray-700"
                                }
                            >
                                {issue}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 🔹 Mood Insight (keep this — it's good) */}
            {predictedMood && (
                <div className="mt-4 bg-blue-50 border border-blue-300 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-800">
                        🧠 Mood Insight ({predictedMood}):
                    </p>

                    {predictedMood.toLowerCase().includes("happy") ||
                        predictedMood.toLowerCase().includes("neutral") ? (
                        <ul className="list-disc list-inside text-sm mt-2 text-blue-800">
                            <li>Keep maintaining your positive habits.</li>
                            <li>Stay socially active and engaged.</li>
                            <li>Continue activities that make you happy.</li>
                        </ul>
                    ) : (
                        <ul className="list-disc list-inside text-sm mt-2 text-red-700">
                            <li>Take small breaks and relax your mind.</li>
                            <li>Try light exercise or a short walk.</li>
                            <li>Talk to someone you trust.</li>
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}