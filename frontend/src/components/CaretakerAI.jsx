import React, { useState } from "react";
import API from "../api/axiosConfig";

export default function CaretakerAI() {

    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const generateSummary = async () => {

        setLoading(true);

        try {

            const res = await API.get("/api/ai/caretaker-summary");

            setSummary(res.data.summary);

        } catch (err) {

            console.error(err);

            setSummary("⚠️ Failed to generate summary");

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-5 border mb-6">

            <div className="flex items-center justify-between mb-4">

                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        🤖 Caretaker AI Assistant
                    </h2>

                    <p className="text-sm text-gray-500">
                        AI-generated summary for caretaker
                    </p>
                </div>

                <button
                    onClick={generateSummary}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    Generate Summary
                </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border min-h-[120px]">

                {loading ? (
                    <p className="text-gray-500">
                        Generating AI summary...
                    </p>
                ) : summary ? (
                    <p className="text-gray-700 whitespace-pre-line">
                        {summary}
                    </p>
                ) : (
                    <p className="text-gray-400">
                        AI summary will appear here
                    </p>
                )}

            </div>
        </div>
    );
}