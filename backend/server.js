import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import caretakerRoutes from "./routes/caretakerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js"






connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/user", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/caretaker", caretakerRoutes);

app.use("/api/ai", aiRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
