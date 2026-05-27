import express from "express";
import {
  signup,
  login,
  checkAuth,
  updateProfile,
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ================= AUTH ROUTES =================
router.post("/signup", signup);
router.post("/login", login);

// ================= PROTECTED ROUTES =================
router.get("/check", protect, checkAuth);
router.put("/update", protect, updateProfile);

export default router;
