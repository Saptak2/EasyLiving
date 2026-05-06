import React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from "recharts";

export default function HistoryGraphModal({
    isOpen,
    onClose,
    historyData,
    days,
    elderName
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative animate-fadeIn">

                {/* CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full"
                >
                    ✕
                </button>

                {/* HEADER */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        📈 {elderName} - {days} Day Trend
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                        Lifestyle and activity analysis
                    </p>
                </div>

                {/* GRAPH */}
                {historyData.length === 0 ? (
                    <p className="text-gray-500">No history data available.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={historyData}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="date" />
                            <YAxis />

                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="sleep"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                name="Sleep"
                            />

                            <Line
                                type="monotone"
                                dataKey="screen"
                                stroke="#ef4444"
                                strokeWidth={3}
                                name="Screen"
                            />

                            <Line
                                type="monotone"
                                dataKey="exercise"
                                stroke="#22c55e"
                                strokeWidth={3}
                                name="Exercise"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}