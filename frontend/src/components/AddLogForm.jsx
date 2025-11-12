import React from "react";
import API from "../api/axiosConfig";
export default function AddLogForm({
    formType, setFormType,
    moodNote, setMoodNote,
    sleepHours, setSleepHours,
    screenTime, setScreenTime,
    exerciseMinutes, setExerciseMinutes,
    caffeineMg, setCaffeineMg,
    foodExpense, setFoodExpense,
    medicalExpense, setMedicalExpense,
    transportExpense, setTransportExpense,
    personalExpense, setPersonalExpense,
    activityName, setActivityName,
    durationMinutes, setDurationMinutes,
    moodScore, setMoodScore, addLog
}) {

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Add New Log</h2>
            <p className="text-sm text-gray-500 mb-4">
                Record your daily wellness details below.
            </p>

            <form onSubmit={addLog} className="space-y-4">
                {/* Select Log Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Log Type
                    </label>
                    <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                    >
                        <option value="mood">Mood Log</option>
                        <option value="expense">Expense Log</option>
                        <option value="activity">Activity Log</option>
                    </select>
                </div>

                {/* 🌿 Mood Log Section */}
                {formType === "mood" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sleep Hours
                            </label>
                            <input
                                type="number"
                                value={sleepHours}
                                onChange={(e) => setSleepHours(e.target.value)}
                                placeholder="e.g., 7"
                                min="0"
                                max="24"
                                className="border rounded-md p-2 w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Screen Time (hours)
                            </label>
                            <input
                                type="number"
                                value={screenTime}
                                onChange={(e) => setScreenTime(e.target.value)}
                                placeholder="e.g., 4"
                                min="0"
                                max="24"
                                className="border rounded-md p-2 w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Exercise Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={exerciseMinutes}
                                onChange={(e) => setExerciseMinutes(e.target.value)}
                                placeholder="e.g., 30"
                                min="0"
                                className="border rounded-md p-2 w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Caffeine Intake (mg)
                            </label>
                            <select
                                value={caffeineMg}
                                onChange={(e) => setCaffeineMg(e.target.value)}
                                className="border rounded-md p-2 w-full"
                                required
                            >
                                <option value="">Select Intake</option>
                                <option value="0">0 mg</option>
                                <option value="50">50 mg</option>
                                <option value="100">100 mg</option>
                                <option value="150">150 mg</option>
                                <option value="200">200 mg</option>
                                <option value="271">271 mg</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mood Note
                            </label>
                            <textarea
                                rows="3"
                                value={moodNote}
                                onChange={(e) => setMoodNote(e.target.value)}
                                placeholder="Describe your mood or day..."
                                className="border rounded-md p-2 w-full"
                            />
                        </div>
                    </>
                )}

                {/* Expense Log Section */}
                {formType === "expense" && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Food (₹)
                                </label>
                                <input
                                    type="number"
                                    value={foodExpense}
                                    onChange={(e) => setFoodExpense(e.target.value)}
                                    placeholder="e.g., 150"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Medical (₹)
                                </label>
                                <input
                                    type="number"
                                    value={medicalExpense}
                                    onChange={(e) => setMedicalExpense(e.target.value)}
                                    placeholder="e.g., 200"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Transport (₹)
                                </label>
                                <input
                                    type="number"
                                    value={transportExpense}
                                    onChange={(e) => setTransportExpense(e.target.value)}
                                    placeholder="e.g., 50"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Personal (₹)
                                </label>
                                <input
                                    type="number"
                                    value={personalExpense}
                                    onChange={(e) => setPersonalExpense(e.target.value)}
                                    placeholder="e.g., 100"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/*  Activity Log Section */}
                {formType === "activity" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Activity Name
                            </label>
                            <input
                                type="text"
                                value={activityName}
                                onChange={(e) => setActivityName(e.target.value)}
                                placeholder="e.g., Morning Walk"
                                className="border rounded-md p-2 w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                placeholder="e.g., 30"
                                className="border rounded-md p-2 w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mood Score (1–5)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={moodScore}
                                onChange={(e) => setMoodScore(e.target.value)}
                                className="border rounded-md p-2 w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                rows="3"
                                value={moodNote}
                                onChange={(e) => setMoodNote(e.target.value)}
                                placeholder="Any additional notes..."
                                className="border rounded-md p-2 w-full"
                            />
                        </div>
                    </>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-green-600 text-white w-full py-2 rounded-md hover:bg-green-700 transition"
                >
                    Add Log
                </button>
            </form>
        </div>
    );
}