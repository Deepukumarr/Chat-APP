import express from "express";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  markMessageAsSeen,
} from "../controllers/messageController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 👇 YE LINE YAHI HOGI
router.get("/users", protect, getUsersForSidebar);

router.get("/:id", protect, getMessages);
router.post("/send/:id", protect, sendMessage);
router.put("/mark/:id", protect, markMessageAsSeen);

export default router;
