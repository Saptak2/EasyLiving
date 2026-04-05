import express from "express";
import { registerUser, loginUser, getUserProfile, registerCaretaker } from "../controllers/authController.js";
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

// @route POST /api/auth/register
router.post("/register", registerUser);
router.post("/register-caretaker", registerCaretaker);
// @route POST /api/auth/login
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

export default router;
