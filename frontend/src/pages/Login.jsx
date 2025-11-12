import React, { useState } from "react";
import API from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/api/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.user.id);

            alert("✅ Login successful!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("❌ Invalid credentials or user not found.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex justify-center items-center px-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
                <h2 className="text-3xl font-semibold text-center text-green-700 mb-2">
                    Welcome Back 
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    Sign in to continue your wellness journey.
                </p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-400 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-400 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Register Link */}
                <p className="text-center text-sm text-gray-600">
                    New to Wellness Support?{" "}
                    <button
                        onClick={() => navigate("/register")}
                        className="text-green-600 font-medium hover:underline"
                    >
                        Create an Account
                    </button>
                </p>
            </div>
        </div>
    );
}
