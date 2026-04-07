import MoodLog from "../models/MoodLog.js";
import ExpenseLog from "../models/ExpenseLog.js";
import ActivityLog from "../models/ActivityLog.js";
import { generateAlerts } from "../utils/alertService.js";

// ---- MOOD LOG ----
export const addMoodLog = async (req, res) => {
    try {
        const userId = req.user.id;

        // 🔥 CHECK DAILY LIMIT
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingLog = await MoodLog.findOne({
            userId,
            createdAt: { $gte: startOfDay }
        });

        if (existingLog) {
            return res.status(400).json({
                message: "You have already logged your mood today"
            });
        }

        const { moodNote, sleepHours, screenTimeHours, exerciseMinutes, caffeineMg, predictedMood } = req.body;

        const log = new MoodLog({
            userId,
            moodNote,
            sleepHours,
            screenTimeHours,
            exerciseMinutes,
            caffeineMg,
            predictedMood   // 🔥 ADD THIS
        });

        await log.save();

        res.status(201).json({
            message: "Mood log added successfully",
            log
        });

    } catch (error) {
        console.error("Mood Log Error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
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
