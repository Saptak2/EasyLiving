import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";

export default function CaretakerDashboard() {
    const [email, setEmail] = useState("");
    const [elderlyList, setElderlyList] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchElderly();
        fetchAlerts();
    }, []);

    // 🔥 Get elderly users
    const fetchElderly = async () => {
        try {
            const res = await API.get("/api/caretaker/my-elderly");
            setElderlyList(res.data);
        } catch (err) {
            console.error(err);
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
    const fetchAlerts = async () => {
        try {
            const res = await API.get("/api/alerts/caretaker");
            setAlerts(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-6">
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
                                className="p-4 border rounded-lg shadow-md bg-white"
                            >
                                <h3 className="text-lg font-semibold">
                                    {user.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {user.email}
                                </p>

                                <div className="mt-2">
                                    <p>
                                        <strong>Today Mood:</strong>{" "}
                                        <span className="text-blue-600">
                                            {user.mood || "No Data"}
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <p>
                                        <strong>Alert:</strong>{" "}
                                        {user.alert ? (
                                            <span className="text-red-600 font-semibold">
                                                {user.alert}
                                            </span>
                                        ) : (
                                            <span className="text-green-600">
                                                No Alert
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🔥 ALERTS SECTION */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    🚨 Alerts
                </h2>

                {alerts.length === 0 ? (
                    <p className="text-gray-500">No alerts today ✅</p>
                ) : (
                    alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`p-4 mb-3 rounded-md text-white ${alert.type === "CRITICAL"
                                ? "bg-red-500"
                                : "bg-orange-400"
                                }`}
                        >
                            <h3 className="font-semibold">
                                {alert.type} ALERT
                            </h3>
                            <p>{alert.message}</p>
                            <p className="text-sm">
                                👤 {alert.userId?.name}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}