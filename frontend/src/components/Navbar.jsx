import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get("/api/auth/profile");
                setUser(res.data.user);
            } catch (err) {
                console.error("❌ Error fetching user:", err);
                navigate("/login");
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        alert("👋 Logged out successfully!");
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 w-full z-50">
            <div
                onClick={() => navigate("/dashboard")}
                className="text-2xl font-semibold text-green-700 cursor-pointer"
            >
                🌿EasyLiving- Wellness Support
            </div>

            <div className="flex items-center gap-4">
                {user && (
                    <>
                        <button
                            onClick={() => navigate("/profile")}
                            className="text-gray-700 font-medium hover:text-green-700 transition"
                        >
                            👤 {user.name?.split(" ")[0] || "Profile"}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
