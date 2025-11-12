import { Trash2, Smile, Wallet, Activity } from "lucide-react";

export default function RecentLogs({ logs, removeLog }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Recent Logs</h2>
            <hr className="mb-4 text-gray-300" />

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {logs && logs.length > 0 ? (
                    logs.map((l, i) => {
                        const date = l.createdAt
                            ? new Date(l.createdAt).toISOString().split("T")[0]
                            : l.date
                                ? new Date(l.date).toISOString().split("T")[0]
                                : "—";


                        const colorMap = {
                            mood: "bg-yellow-50 border-yellow-200",
                            expense: "bg-red-50 border-red-200",
                            routine: "bg-blue-50 border-blue-200",
                        };

                        const color = colorMap[l.type] || "bg-gray-50 border-gray-200";

                        return (
                            <div
                                key={l._id || l.id || i}
                                className={`flex justify-between items-start p-4 border rounded-lg transition hover:shadow-sm ${color}`}
                            >
                                {/* Left Section */}
                                <div className="flex flex-col w-full">
                                    {/* 🧾 Header */}
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        {l.type === "mood" && <Smile size={16} className="text-yellow-600" />}
                                        {l.type === "expense" && <Wallet size={16} className="text-red-600" />}
                                        {l.type === "routine" && <Activity size={16} className="text-blue-600" />}
                                        <span>
                                            {l.type?.charAt(0).toUpperCase() + l.type?.slice(1)} — {date}
                                        </span>
                                    </div>

                                    {/* 💬 Details */}
                                    <div className="text-xs text-gray-700 mt-1 leading-relaxed">
                                        {/* 🌿 Mood Logs */}
                                        {l.type === "mood" && (
                                            <>
                                                😊 <strong>{l.predictedMood || "Unknown"}</strong>
                                                {l.modelConfidence && ` (${l.modelConfidence}%)`}
                                                {l.moodNote && ` — “${l.moodNote}”`}
                                                <div className="text-gray-600 mt-1">
                                                    <span>💤 {l.sleepHours}h sleep</span> |{" "}
                                                    <span>📱 {l.screenTimeHours}h screen</span> |{" "}
                                                    <span>🏋️ {l.exerciseMinutes}m exercise</span> |{" "}
                                                    <span>☕ {l.caffeineMg}mg caffeine</span>
                                                </div>
                                            </>
                                        )}

                                        {/* 💸 Expense Logs */}
                                        {l.type === "expense" && (
                                            <div>
                                                💸 <strong>Total: ₹{l.totalExpense || 0}</strong>
                                                <div className="text-gray-600 mt-1">
                                                    🍔 Food ₹{l.foodExpense || 0} | 💊 Medical ₹{l.medicalExpense || 0} | 🚗 Transport ₹
                                                    {l.transportExpense || 0} | 🎁 Personal ₹{l.personalExpense || 0}
                                                </div>
                                            </div>
                                        )}

                                        {/* 🏃 Routine Logs */}
                                        {l.type === "routine" && (
                                            <>
                                                🏃 <strong>{l.activityName || l.activity || "Activity"}</strong> —{" "}
                                                {l.durationMinutes || l.duration || 0} min
                                                {l.moodScore && (
                                                    <span className="ml-2 text-gray-600">(Mood Score: {l.moodScore})</span>
                                                )}
                                                {l.notes && <div className="text-gray-600 mt-1">🗒️ “{l.notes}”</div>}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Delete Button (optional) */}
                                {/* 
                <button
                  onClick={() => removeLog(l._id || l.id)}
                  className="text-xs text-red-600 hover:text-red-800 cursor-pointer ml-2"
                  title="Delete log"
                >
                  <Trash2 size={14} />
                </button>
                */}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-gray-500 text-center">No logs yet. Start by adding a new entry!</p>
                )}
            </div>
        </div>
    );
}
