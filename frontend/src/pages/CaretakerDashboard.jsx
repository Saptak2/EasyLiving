import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import Navbar from "../components/Navbar";
import HistoryGraphModal from "../components/HistoryGraphModal";

export default function CaretakerDashboard() {
    const [email, setEmail] = useState("");
    const [elderlyList, setElderlyList] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [historyDays, setHistoryDays] = useState(7);
    const [showGraph, setShowGraph] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState("");


    useEffect(() => {
        fetchElderly();
    }, []);

    // 🔥 Get elderly users
    const fetchElderly = async () => {
        try {
            const res = await API.get("/api/caretaker/my-elderly");
            const sorted = res.data.sort((a, b) => {
                const scoreA = a.lifestyle_score ?? 1; // null → best
                const scoreB = b.lifestyle_score ?? 1;

                return scoreA - scoreB; // lowest first
            });

            setElderlyList(sorted);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async (userId, days, userName) => {
        try {
            const res = await API.get(
                `/api/caretaker/history?userId=${userId}&days=${days}`
            );

            const formatted = res.data.map((item) => ({
                date: new Date(item.date).toLocaleDateString(),
                sleep: item.sleep,
                screen: item.screen,
                exercise: item.exercise
            }));

            setHistoryData(formatted);
            setSelectedUser(userId);
            setHistoryDays(days);
            setSelectedUserName(userName);
            setShowGraph(true);

        } catch (err) {
            console.error("History fetch error:", err);
        }
    };

    // 🔥 Add elderly
    const handleAdd = async () => {
        try {
            await API.post("/api/caretaker/add-elderly", { email });
            alert("✅ Elderly added");
            setEmail("");
            fetchElderly();
        } catch (err) {
            alert(err.response?.data?.message || "Error");
        }
    };

    // 🔥 Get alerts
    // const fetchAlerts = async () => {
    //     try {
    //         const res = await API.get("/api/alerts/caretaker");
    //         setAlerts(res.data || []);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };
    const getStatus = (score) => {
        if (!score) return "No Data";
        if (score > 0.7) return "Good";
        if (score > 0.4) return "Moderate";
        return "Needs Attention";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-5">
                <h1 className="text-2xl font-bold mt-20 mb-6">
                    👨‍⚕️ Caretaker Dashboard
                </h1>

                {/* 🔥 ADD ELDER */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">
                        ➕ Add Elderly User
                    </h2>

                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter elder's email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 rounded w-64"
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* 🔥 ELDER CARDS */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">
                        👥 My Elderly Users
                    </h2>

                    {elderlyList.length === 0 ? (
                        <p>No users added yet</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {elderlyList.map((user) => (
                                <div
                                    key={user._id}
                                    className="bg-white rounded-2xl shadow-lg p-5 border hover:shadow-xl transition duration-300"
                                >

                                    {/* HEADER */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {user.name || "Unnamed User"}
                                            </h3>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>

                                        {/* STATUS BADGE */}
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold 
            ${user.lifestyle_score > 0.7
                                                ? "bg-green-100 text-green-700"
                                                : user.lifestyle_score > 0.4
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}>
                                            {getStatus(user.lifestyle_score)}
                                        </span>
                                    </div>

                                    {/* DIVIDER */}
                                    <hr className="my-3" />

                                    {/* SCORE */}
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-sm text-gray-600">Lifestyle Score</p>
                                        <p className={`text-lg font-bold 
            ${user.lifestyle_score > 0.7
                                                ? "text-green-600"
                                                : user.lifestyle_score > 0.4
                                                    ? "text-orange-500"
                                                    : "text-red-500"
                                            }`}>
                                            {user.lifestyle_score || "N/A"}
                                        </p>
                                    </div>

                                    {/* MOOD */}
                                    <p className="text-sm mb-3">
                                        🧠 <strong>Mood:</strong>{" "}
                                        <span className="text-blue-600">{user.mood}</span>
                                    </p>

                                    {/* ISSUES */}
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                            ⚠️ Issues
                                        </p>
                                        <ul className="text-sm space-y-1">
                                            {(user.issues_detected || []).length > 0 ? (
                                                user.issues_detected.map((i, idx) => (
                                                    <li key={idx} className="text-red-600">
                                                        • {i}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-green-600">• No issues</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* HEALTH STATS */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p>💤 Sleep: {user.sleepHours}h</p>
                                        <p>📱 Screen: {user.screenTimeHours}h</p>
                                        <p>🏃 Exercise: {user.exerciseMinutes}m</p>
                                        <p>🚶 Activity: {user.activityDuration}m</p>
                                    </div>

                                    {/* EXPENSE */}
                                    <div className="mt-3 text-sm font-medium">
                                        💰 Expense: ₹{user.todayExpense}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => fetchHistory(user._id, 7, user.name)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                                        >
                                            📊 7 Days
                                        </button>

                                        <button
                                            onClick={() => fetchHistory(user._id, 30, user.name)}
                                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                                        >
                                            📈 30 Days
                                        </button>
                                    </div>


                                </div>
                            ))}
                        </div>
                    )}
                </div>


            </div>
            <HistoryGraphModal
                isOpen={showGraph}
                onClose={() => setShowGraph(false)}
                historyData={historyData}
                days={historyDays}
                elderName={selectedUserName}
            />
        </div>
    );
}