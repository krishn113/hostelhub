// server/src/routes/complaintRoutes.js
import express from "express";
import { 
  createComplaint, 
  getMyComplaints, 
  getComplaints, 
  submitSlots,
  manageComplaint,
  getSlotStatistics,
  sendReminder
} from "../controllers/complaintController.js";
import { protect, caretakerOnly } from "../middleware/auth.js";

const router = express.Router();

// 1. SPECIFIC ROUTES FIRST
router.get("/my-complaints", protect, getMyComplaints);
router.get("/stats", protect, caretakerOnly, getSlotStatistics);

// 2. GENERAL ROUTES SECOND
router.post("/", protect, createComplaint);
router.get("/", protect, caretakerOnly, getComplaints);

// 3. PARAMETER ROUTES LAST
router.patch("/:id/submit-slots", protect, submitSlots);
router.patch("/:id/manage", protect, caretakerOnly, manageComplaint);
router.patch("/:id/reminder", protect, sendReminder);
export default router;