import User from "../models/User.js";
import MoodLog from "../models/MoodLog.js";
import Alert from "../models/Alert.js";

export const addElderly = async (req, res) => {
    try {
        const caretakerId = req.user._id;   // logged-in caretaker
        const { email } = req.body;

        // 🔍 find elderly
        const elderly = await User.findOne({ email });

        if (!elderly) {
            return res.status(404).json({ message: "Elderly user not found" });
        }

        // ❌ cannot add caretaker
        if (elderly.role === "caretaker") {
            return res.status(400).json({ message: "Cannot add a caretaker" });
        }

        // ❌ already assigned
        if (elderly.caretakerId) {
            return res.status(400).json({ message: "Already assigned to a caretaker" });
        }

        // 🔥 link
        elderly.caretakerId = caretakerId;
        await elderly.save();

        res.json({
            message: "Elderly linked successfully"
        });

    } catch (err) {
        console.error("Add elderly error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


export const getMyElderly = async (req, res) => {
    try {
        const caretakerId = req.user._id;

        const users = await User.find({ caretakerId });

        const result = [];

        for (let user of users) {
            // 🔥 latest mood
            const latestLog = await MoodLog.findOne({ userId: user._id })
                .sort({ createdAt: -1 });

            // 🔥 alert status
            const alert = await Alert.findOne({
                userId: user._id,
                isActive: true
            });

            result.push({
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                mood: latestLog?.predictedMood || "No Data",
                alert: alert ? alert.type : null
            });
        }

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};