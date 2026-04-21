import axios from "axios";
import User from "../models/User.js";
import ExpenseLog from "../models/ExpenseLog.js";
import MoodLog from "../models/MoodLog.js";
import ActivityLog from "../models/ActivityLog.js";

export const getRecommendation  = async (req, res) => {
    try {
        const { userId } = req.body;


        // 🔥 FETCH USER DATA FROM MONGO
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // ===============================
        // 🔥 FETCH CURRENT (LATEST LOG)
        // ===============================
        const latestLog = await MoodLog.findOne({ userId: user._id })
            .sort({ createdAt: -1 });

        const currentSleep = latestLog?.sleepHours || 0;
        const currentScreen = latestLog?.screenTimeHours || 0;
        const currentExercise = latestLog?.exerciseMinutes || 0;


        // ===============================
        // 🔥 FETCH LAST 7 DAYS DATA
        // ===============================
        const sevenDaysAgoMood = new Date();
        sevenDaysAgoMood.setDate(sevenDaysAgoMood.getDate() - 7);

        const logs = await MoodLog.find({
            userId: user._id,
            createdAt: { $gte: sevenDaysAgoMood }
        });

        const avgSleep = logs.length
            ? logs.reduce((s, l) => s + l.sleepHours, 0) / logs.length
            : 0;

        const avgScreen = logs.length
            ? logs.reduce((s, l) => s + l.screenTimeHours, 0) / logs.length
            : 0;

        const avgExercise = logs.length
            ? logs.reduce((s, l) => s + l.exerciseMinutes, 0) / logs.length
            : 0;

        // ===============================
        // 🔥 FETCH CURRENT ACTIVITY
        // ===============================
        const latestActivity = await ActivityLog.findOne({ userId: user._id })
            .sort({ createdAt: -1 });
            
        const currentActivityDuration = latestActivity?.durationMinutes || 0;
            
            
        // ===============================
        // 🔥 FETCH LAST 7 DAYS ACTIVITY
        // ===============================
        const activityLogs = await ActivityLog.find({
            userId: user._id,
            createdAt: { $gte: sevenDaysAgoMood }
        });
            
        const avgActivityDuration = activityLogs.length
            ? activityLogs.reduce((s, l) => s + l.durationMinutes, 0) / activityLogs.length
            : 0;

        

        const avgExpense = user.avg_monthly_expense_level;
        const userExercise = user.exercise_time_per_day_minutes || 0;
        const userScreen = user.daily_screen_time_hours || 0;

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const expenseAgg = await ExpenseLog.aggregate([
            { $match: { userId: user._id, createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: null, total_expense_7days: { $sum: "$totalExpense" } } },
        ]);

        const totalExpense =
            expenseAgg.length > 0 ? expenseAgg[0].total_expense_7days : 0;

        const weeklyAvgExpense = avgExpense / 4;

        console.log("👉 7-day expense from DB:", totalExpense);
        console.log("👉 User avg monthly:", avgExpense);
        console.log("👉 Weekly avg:", weeklyAvgExpense);

        // 🔥 SEND TO ML API
        const response = await axios.post("http://127.0.0.1:8000/recommend", {
            sleep: currentSleep,
            screen: currentScreen,
            exercise: currentExercise,
            expense: totalExpense,
            activity_duration: currentActivityDuration,
            avg_expense: weeklyAvgExpense,
            user_sleep: avgSleep,
            user_screen: avgScreen,   // ✅ NEW
            user_exercise: avgExercise,
            user_activity: avgActivityDuration 
        });


        return res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error("Recommendation error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to get recommendation"
        });
    }
};