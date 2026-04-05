import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";

export default function CaretakerDashboard() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchAlerts();
    }, []);

    async function fetchAlerts() {
        try {
            const res = await API.get("/api/alerts");
            setAlerts(res.data || []);
        } catch (err) {
            console.error("❌ Error fetching alerts:", err);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                🚨 Caretaker Alerts
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
                        <h3 className="font-semibold">{alert.type} ALERT</h3>
                        <p>{alert.message}</p>
                    </div>
                ))
            )}
        </div>
    );
}