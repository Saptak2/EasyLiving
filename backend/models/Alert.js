import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["WARNING", "CRITICAL"],
    },
    message: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;