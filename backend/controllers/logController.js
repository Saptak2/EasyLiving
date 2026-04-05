import MoodLog from "../models/MoodLog.js";
import ExpenseLog from "../models/ExpenseLog.js";
import ActivityLog from "../models/ActivityLog.js";
import { generateAlerts } from "../utils/alertService.js";

// ---- MOOD LOG ----
export const addMoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { moodNote, sleepHours, screenTimeHours, exerciseMinutes, caffeineMg } = req.body;

        const log = new MoodLog({
            userId, moodNote, sleepHours, screenTimeHours, exerciseMinutes, caffeineMg
        });
        await log.save();
        res.status(201).json({ message: "Mood log added successfully", log });
    } catch (error) {
        console.error("Mood Log Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ---- EXPENSE LOG ----
export const addExpenseLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodExpense, medicalExpense, transportExpense, personalExpense } = req.body;

        const log = new ExpenseLog({
            userId, foodExpense, medicalExpense, transportExpense, personalExpense
        });
        await log.save();
        res.status(201).json({ message: "Expense log added successfully", log });
    } catch (error) {
        console.error("Expense Log Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ---- ACTIVITY LOG ----
export const addActivityLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { activityName, durationMinutes, moodScore, notes } = req.body;

        const log = new ActivityLog({
            userId, activityName, durationMinutes, moodScore, notes
        });
        await log.save();
        res.status(201).json({ message: "Activity log added successfully", log });
    } catch (error) {
        console.error("Activity Log Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
