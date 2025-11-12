import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import ExpenseLog from "../models/ExpenseLog.js";
import ActivityLog from "../models/ActivityLog.js";
import MoodLog from "../models/MoodLog.js";
import mongoose from "mongoose";

let latestRecommendations = [];


router.get("/weekly", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // 📅 Date Range
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        // 💸 1️⃣ Calculate 7-day total expense
        const expenseAgg = await ExpenseLog.aggregate([
            { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: null, total_expense_7days: { $sum: "$totalExpense" } } },
        ]);
        const total_expense_7days =
            expenseAgg.length > 0 ? expenseAgg[0].total_expense_7days : 0;

        // 😌 2️⃣ Mood averages per day (not just last 7 entries)
        const moodToScore = { happy: 5, neutral: 3, sad: 2, stressed: 1 };

        // Group moods by day and average within the group
        const moodDailyAgg = await MoodLog.aggregate([
            {
                $match: { userId, createdAt: { $gte: sevenDaysAgo } },
            },
            {
                $addFields: {
                    dateOnly: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    moodScore: {
                        $switch: {
                            branches: [
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "happy"] }, then: 5 },
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "neutral"] }, then: 3 },
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "sad"] }, then: 2 },
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "stressed"] }, then: 1 },
                            ],
                            default: 0,
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$dateOnly",
                    avgDailyMood: { $avg: "$moodScore" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Compute overall weekly average from daily averages
        const dailyAverages = moodDailyAgg.map((d) => d.avgDailyMood);
        const avg_mood_7days =
            dailyAverages.length > 0
                ? Number(
                    (dailyAverages.reduce((a, b) => a + b, 0) / dailyAverages.length).toFixed(2)
                )
                : 0;

        // 🌈 Label for weekly mood
        let overall_mood_label = "No Data";
        if (avg_mood_7days >= 4.2) overall_mood_label = "Happy";
        else if (avg_mood_7days >= 3.2) overall_mood_label = "Neutral";
        else if (avg_mood_7days >= 2) overall_mood_label = "Sad";
        else if (avg_mood_7days > 0) overall_mood_label = "Stressed";

        // 🏃 3️⃣ Top activity in last 14 days
        const topActivityAgg = await ActivityLog.aggregate([
            { $match: { userId, createdAt: { $gte: fourteenDaysAgo } } },
            { $group: { _id: "$activityName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ]);
        const top_activity_14days =
            topActivityAgg.length > 0 ? topActivityAgg[0]._id : "None logged";

        // ✅ Final response
        res.status(200).json({
            avg_mood_7days,
            overall_mood_label,
            mood_daily_trend: moodDailyAgg.map((d) => ({
                date: d._id,
                avgMood: Number(d.avgDailyMood.toFixed(2)),
                entries: d.count,
            })),
            total_expense_7days: Number(total_expense_7days.toFixed(2)),
            top_activity_14days,
            message: "Weekly insights fetched successfully ✅",
        });
    } catch (error) {
        console.error("❌ Error fetching weekly insights:", error);
        res.status(500).json({
            message: "Server error while fetching weekly insights.",
            error: error.message,
        });
    }
});




router.post("/save", (req, res) => {
    const { recommendations } = req.body;

    if (!recommendations || !Array.isArray(recommendations)) {
        return res.status(400).json({ message: "No valid recommendations provided." });
    }

    latestRecommendations = recommendations;
    res.status(200).json({ message: "✅ Recommendations saved successfully!" });
});
router.get("/recommendations", (req, res) => {
    try {
        const recs = latestRecommendations.length > 0 ? latestRecommendations : [
            "💧 Stay hydrated and take short breaks between work.",
            "🚶‍♂️ Include 20–30 mins of light physical activity daily.",
            "🕓 Try maintaining consistent sleep hours.",
            "📵 Reduce screen time an hour before bed.",
            "💰 Track your daily spending to spot saving opportunities.",
        ];

        res.status(200).json({ recommendations: recs });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: "Server error while fetching recommendations." });
    }
});

router.get("/trends/mood", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // MongoDB aggregation to group by day
        const moodToScore = { happy: 5, neutral: 3, sad: 2, stressed: 1 };

        const dailyMoodAgg = await MoodLog.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $addFields: {
                    moodScore: {
                        $switch: {
                            branches: [
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "happy"] }, then: 5 },
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "neutral"] }, then: 3 },
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "sad"] }, then: 2 },
                                { case: { $eq: [{ $toLower: "$predictedMood" }, "stressed"] }, then: 1 },
                            ],
                            default: 0,
                        },
                    },
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                },
            },
            {
                $group: {
                    _id: "$day",
                    avgMood: { $avg: "$moodScore" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // 💡 Prepare chart data
        const line_chart = dailyMoodAgg.map((d) => ({
            date: d._id,
            mood_score: Number(d.avgMood.toFixed(2)),
            count: d.count,
        }));

        // Pie chart: count moods across entire period
        const moodCounts = await MoodLog.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $toLower: "$predictedMood" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const pie_chart = { happy: 0, neutral: 0, sad: 0, stressed: 0 };
        moodCounts.forEach((m) => {
            if (pie_chart[m._id] !== undefined) {
                pie_chart[m._id] = m.count;
            }
        });

        res.json({ line_chart, pie_chart });
    } catch (error) {
        console.error("❌ Error fetching mood trends:", error);
        res.status(500).json({ error: "Failed to fetch mood trends" });
    }
});

router.get("/trends/expense", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1️⃣ Aggregate daily totals per category
        const dailyAgg = await ExpenseLog.aggregate([
            {
                $match: {
                    userId,
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $addFields: {
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                },
            },
            {
                $group: {
                    _id: "$day",
                    foodExpense: { $sum: "$foodExpense" },
                    medicalExpense: { $sum: "$medicalExpense" },
                    transportExpense: { $sum: "$transportExpense" },
                    personalExpense: { $sum: "$personalExpense" },
                    totalExpense: { $sum: "$totalExpense" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // 2️⃣ Prepare charts
        const line_chart = dailyAgg.map((d) => ({
            date: d._id,
            total: Number(d.totalExpense.toFixed(2)),
        }));

        const stacked_bar = dailyAgg.map((d) => ({
            date: d._id,
            foodExpense: d.foodExpense,
            medicalExpense: d.medicalExpense,
            transportExpense: d.transportExpense,
            personalExpense: d.personalExpense,
        }));

        // 3️⃣ Pie chart — total sums across 30 days
        const pie_chart = stacked_bar.reduce(
            (acc, day) => {
                acc.foodExpense += day.foodExpense;
                acc.medicalExpense += day.medicalExpense;
                acc.transportExpense += day.transportExpense;
                acc.personalExpense += day.personalExpense;
                return acc;
            },
            { foodExpense: 0, medicalExpense: 0, transportExpense: 0, personalExpense: 0 }
        );

        res.json({ line_chart, pie_chart, stacked_bar });
    } catch (error) {
        console.error("❌ Error fetching expense trends:", error);
        res.status(500).json({ error: "Failed to fetch expense trends" });
    }
});


router.get("/trends/activity", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const activityCounts = await ActivityLog.aggregate([
            { $match: { userId, createdAt: { $gte: fourteenDaysAgo } } },
            { $group: { _id: "$activityName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        const formatted = activityCounts.map((a) => ({
            activity: a._id,
            count: a.count,
        }));

        res.status(200).json(formatted);
    } catch (err) {
        console.error("❌ Error fetching activity trends:", err);
        res.status(500).json({ error: "Failed to fetch activity trends" });
    }
});

export default router;
