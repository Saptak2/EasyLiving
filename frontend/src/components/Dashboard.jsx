import React, { useState, useEffect } from "react";
import StatsCards from "./StatsCards";
import AddLogForm from "./AddLogForm";
import Recommendations from "./Recommendations";
import RecentLogs from "./RecentLogs";
import Navbar from "./Navbar";
import TrendsModal from "./TrendsModal";
import API from "../api/axiosConfig";

export default function ElderlyWellnessDashboard() {
    const userId = localStorage.getItem("userId");

    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    const [formType, setFormType] = useState("mood");

    const [sleepHours, setSleepHours] = useState("");
    const [screenTime, setScreenTime] = useState("");
    const [exerciseMinutes, setExerciseMinutes] = useState("");
    const [caffeineMg, setCaffeineMg] = useState("");
    const [moodNote, setMoodNote] = useState("");
    const [predictedMood, setPredictedMood] = useState(null);

    const [foodExpense, setFoodExpense] = useState("");
    const [medicalExpense, setMedicalExpense] = useState("");
    const [transportExpense, setTransportExpense] = useState("");
    const [personalExpense, setPersonalExpense] = useState("");

    const [activityName, setActivityName] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [moodScore, setMoodScore] = useState("");

    const [openMoodTrend, setOpenMoodTrend] = useState(false);
    const [openExpenseTrend, setOpenExpenseTrend] = useState(false);
    const [openActivityTrend, setOpenActivityTrend] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchLogs();
            fetchStats();
            fetchRecommendations();
        } else {
            console.warn("No token found — redirecting to login.");
            window.location.href = "/login";
        }
    }, []);

    async function fetchLogs() {
        try {
            const res = await API.get("/api/logs/all");
            setLogs(res.data.logs);
        } catch (err) {
            console.error("❌ Error fetching logs:", err);
        }
    }

    async function fetchStats() {
        try {
            const res = await API.get("/api/insights/weekly");
            setStats(res.data);
        } catch {
            setStats(null);
        }
    }

    async function fetchRecommendations() {
        try {
            const res = await API.get("/api/insights/recommendations");
            setRecommendations(res.data.recommendations || []);
        } catch {
            setRecommendations([]);
        }
    }

    async function removeLog(id) {
        try {
            await API.delete(`/api/logs/${id}`);
            setLogs((prev) => prev.filter((l) => l._id !== id));
        } catch (err) {
            console.error("Error deleting log:", err);
        }
    }

    function resetForm() {
        setSleepHours("");
        setScreenTime("");
        setExerciseMinutes("");
        setCaffeineMg("");
        setMoodNote("");
        setFoodExpense("");
        setMedicalExpense("");
        setTransportExpense("");
        setPersonalExpense("");
        setActivityName("");
        setDurationMinutes("");
        setMoodScore("");
    }

    async function addLog(e) {
        e.preventDefault();
        try {
            if (formType === "mood") {
                if (!sleepHours || !screenTime || !exerciseMinutes || !caffeineMg) {
                    alert("Please fill all mood input fields before submitting.");
                    return;
                }

                const res = await API.post("/api/ml/predict/mood", {
                    sleepHours: parseFloat(sleepHours),
                    screenTimeHours: parseFloat(screenTime),
                    exerciseMinutes: parseFloat(exerciseMinutes),
                    caffeineMg: parseFloat(caffeineMg),
                    textInput: moodNote || "neutral",
                });

                const predicted = res.data.predicted_mood || "Unknown";
                setPredictedMood(predicted);

                if (res.data.recommendations && res.data.recommendations.length > 0) {
                    setRecommendations((prev) => [...prev, ...res.data.recommendations]);
                }

                alert(`✅ Mood log added! Predicted mood: ${predicted}`);
                await fetchStats();
            }
            else if (formType === "expense") {
                const expenseData = {
                    foodExpense: Number(foodExpense) || 0,
                    medicalExpense: Number(medicalExpense) || 0,
                    transportExpense: Number(transportExpense) || 0,
                    personalExpense: Number(personalExpense) || 0,
                };

                await API.post("/api/logs/expense/add", expenseData);
                alert("✅ Expense log added successfully!");
                await fetchStats();
                await fetchLogs();
            }
            else if (formType === "activity") {
                await API.post("/api/logs/activity/add", {
                    activityName,
                    durationMinutes: Number(durationMinutes),
                    moodScore: Number(moodScore),
                    notes: moodNote || "",
                });
                alert("✅ Activity log added successfully!");
            }

            fetchLogs();
            resetForm();
        } catch (err) {
            console.error("❌ Error adding log:", err);
            alert("Failed to add log. Please check your inputs.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 px-6 pb-10">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Welcome back 👋
                        </h1>
                        <p className="text-gray-600">
                            A quick overview of your wellness journey.
                        </p>
                    </header>

                    <StatsCards
                        stats={stats}
                        predictedMood={predictedMood}
                        onOpenMoodTrend={() => setOpenMoodTrend(true)}
                        onOpenExpenseTrend={() => setOpenExpenseTrend(true)}
                        onOpenActivityTrend={() => setOpenActivityTrend(true)}
                    />

                    <TrendsModal
                        open={openMoodTrend}
                        onClose={() => setOpenMoodTrend(false)}
                        type="mood"
                    />
                    <TrendsModal
                        open={openExpenseTrend}
                        onClose={() => setOpenExpenseTrend(false)}
                        type="expense"
                    />
                    <TrendsModal
                        open={openActivityTrend}
                        onClose={() => setOpenActivityTrend(false)}
                        type="activity"
                    />

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <AddLogForm
                            formType={formType}
                            setFormType={setFormType}
                            sleepHours={sleepHours}
                            setSleepHours={setSleepHours}
                            screenTime={screenTime}
                            setScreenTime={setScreenTime}
                            exerciseMinutes={exerciseMinutes}
                            setExerciseMinutes={setExerciseMinutes}
                            caffeineMg={caffeineMg}
                            setCaffeineMg={setCaffeineMg}
                            moodNote={moodNote}
                            setMoodNote={setMoodNote}
                            foodExpense={foodExpense}
                            setFoodExpense={setFoodExpense}
                            medicalExpense={medicalExpense}
                            setMedicalExpense={setMedicalExpense}
                            transportExpense={transportExpense}
                            setTransportExpense={setTransportExpense}
                            personalExpense={personalExpense}
                            setPersonalExpense={setPersonalExpense}
                            activityName={activityName}
                            setActivityName={setActivityName}
                            durationMinutes={durationMinutes}
                            setDurationMinutes={setDurationMinutes}
                            moodScore={moodScore}
                            setMoodScore={setMoodScore}
                            addLog={addLog}
                        />

                        <div className="space-y-6">
                            <Recommendations
                                recommendations={recommendations}
                                predictedMood={predictedMood}
                            />
                            <RecentLogs logs={logs} removeLog={removeLog} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
