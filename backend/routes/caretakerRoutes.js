import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addElderly } from "../controllers/caretakerController.js";
import { getMyElderly } from "../controllers/caretakerController.js";



const router = express.Router();

// 🔥 Add elderly by email
router.post("/add-elderly", protect, addElderly);
router.get("/my-elderly", protect, getMyElderly);

export default router;