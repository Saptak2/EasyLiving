import React, { useState } from "react";
import API from "../api/axiosConfig";

export default function AICompanion() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMsg = message;

        setChat((prev) => [...prev, { role: "user", text: userMsg }]);
        setMessage("");
        setLoading(true);

        try {
            const res = await API.post("/api/ai/chat", {
                message: userMsg
            });

            setChat((prev) => [
                ...prev,
                { role: "ai", text: res.data.reply }
            ]);

        } catch (err) {
            setChat((prev) => [
                ...prev,
                { role: "ai", text: "⚠️ Something went wrong" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col h-[400px]">
            <h2 className="text-lg font-semibold mb-2 text-green-700">
                🤖 AI Dost
            </h2>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
                {chat.length === 0 && (
                    <p className="text-gray-400 text-sm">
                        Start a conversation with your AI companion 💬
                    </p>
                )}

                {chat.map((c, i) => (
                    <div
                        key={i}
                        className={`p-2 rounded-lg max-w-[80%] ${c.role === "user"
                            ? "bg-green-100 self-end ml-auto"
                            : "bg-gray-100"
                            }`}
                    >
                        {c.text}
                    </div>
                ))}

                {loading && (
                    <p className="text-gray-400 text-sm">Typing...</p>
                )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Talk to AI Dost..."
                    className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                    onClick={sendMessage}
                    className="bg-green-600 text-white px-4 rounded-lg"
                >
                    Send
                </button>
            </div>
        </div>
    );
}