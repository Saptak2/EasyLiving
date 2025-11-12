import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: Number, required: true },

        // Lifestyle & Health
        daily_screen_time_hours: { type: Number, default: 0 },
        sleep_hours: { type: Number, default: 0 },
        daily_caffeine_mg: { type: Number, default: 0 },
        exercise_time_per_day_minutes: { type: Number, default: 0 },

        // Behavioral Patterns
        feelings_logging_frequency: { type: Number, default: 1 }, // e.g., 0=Daily, 1=Weekly, 2=Rarely
        low_mood_response: { type: Number, default: 0 },          // e.g., 0=Talk, 1=Walk, 2=Music
        overspend_frequency: { type: Number, default: 1 },        // 0=Never, 1=Sometimes, 2=Often
        forget_to_log_frequency: { type: Number, default: 1 },

        // Financial
        monthly_income: { type: Number, default: 0 },
        major_expense_category: { type: Number, default: 0 },     // 0=Medical, 1=Grocery, etc.
        avg_monthly_expense_level: { type: Number, default: 0 },  // now numeric (₹ value)
        total_screen_time_hours: { type: Number, default: 0 },

        // Social
        family_member_count: { type: Number, default: 0 },

        // Authentication & Contact
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        emergency_contact: { type: String, default: "" },
        has_email_registered: { type: Number, default: 1 },
        has_emergency_contact: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
