import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register New User
export const registerUser = async (req, res) => {
    try {
        const {
            name, age, gender,
            daily_screen_time_hours, sleep_hours,
            daily_caffeine_mg, exercise_time_per_day_minutes,
            feelings_logging_frequency, low_mood_response,
            monthly_income, major_expense_category,
            avg_monthly_expense_level, overspend_frequency,
            forget_to_log_frequency, total_screen_time_hours,
            family_member_count, email, password, emergency_contact
        } = req.body;


        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const has_email_registered = email ? 1 : 0;
        const has_emergency_contact = emergency_contact ? 1 : 0;


        const user = await User.create({
            name, age, gender,
            daily_screen_time_hours, sleep_hours,
            daily_caffeine_mg, exercise_time_per_day_minutes,
            feelings_logging_frequency, low_mood_response,
            monthly_income, major_expense_category,
            avg_monthly_expense_level, overspend_frequency,
            forget_to_log_frequency, total_screen_time_hours,
            family_member_count, email,
            password: hashedPassword, emergency_contact,
            has_email_registered, has_emergency_contact
        });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                has_emergency_contact: user.has_emergency_contact
            },
            token
        });

    } catch (error) {
        console.error("🚨 Registration Detailed Error:");
        console.error(JSON.stringify(error, null, 2));
        res.status(500).json({
            message: "Server error",
            error: error.message || "Unknown error",
            details: error.errors || error.stack,
        });
    }

};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({ message: "Please enter both email and password" });
        }


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }


        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );


        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                has_emergency_contact: user.has_emergency_contact,
                age: user.age,
                gender: user.gender
            },
            token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
