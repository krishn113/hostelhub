import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { applyHostelLeaving, bookGuestHouse, getMyForms } from "../controllers/studentController.js";

const router = express.Router();

// Apply for hostel leaving
router.post("/hostel-leaving/apply", protect, allowRoles("student"), applyHostelLeaving);

// Apply for guesthouse booking
router.post("/guesthouse/book", protect, allowRoles("student"), bookGuestHouse);

// Get student's forms
router.get("/forms", protect, allowRoles("student"), getMyForms);

export default router;
