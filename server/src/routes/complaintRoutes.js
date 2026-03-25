import express from "express";
const router = express.Router();
import { createComplaint, getMyComplaints, getCaretakerComplaints, toggleUpvote, bulkUpdateComplaints, submitStudentSlots, scheduleVisit, resolveOrReset, quickResolve, getStudentHistory } from "../controllers/complaintController.js";
import { protect, caretakerOnly } from "../middleware/auth.js"; // Your JWT protector

router.post("/", protect, createComplaint);
router.get("/my-complaints", protect, getMyComplaints);



router.get("/caretaker", protect, caretakerOnly, getCaretakerComplaints);
router.patch("/bulk-update", protect, caretakerOnly, bulkUpdateComplaints);


router.get("/:id/history", protect, caretakerOnly, getStudentHistory);
router.patch("/:id/upvote", protect, toggleUpvote);
router.patch("/:id/submit-slots", protect, submitStudentSlots);
router.patch("/:id/schedule-visit", protect, caretakerOnly, scheduleVisit);
router.patch("/:id/resolve-reset", protect, caretakerOnly, resolveOrReset);
router.patch("/:id/quick-resolve", protect, caretakerOnly, quickResolve);
router.patch("/:id/manage", protect, caretakerOnly, async (req, res) => {
  const { action } = req.body; // e.g., "Resolve" or "Get Slot" (for unlocking)
  const complaint = await Complaint.findById(req.params.id);
  
  if (action === "Resolve") {
    complaint.status = "Resolved";
    complaint.timeline.resolvedAt = new Date();
  } else if (action === "Get Slot") {
    // This handles the 'Unlock' feature you have in the UI
    complaint.status = "Get Slot";
    complaint.scheduledVisit = undefined;
  }
  
  await complaint.save();
  res.json({ message: "Updated", complaint });
});

export default router;