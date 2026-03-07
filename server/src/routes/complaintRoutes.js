import express from "express";
import { createComplaint, getMyComplaints, manageComplaint } from "../controllers/complaintController.js";
import { protect } from  "../middleware/auth.js";


const router = express.Router();

// Student routes
router.post("/", protect, createComplaint); 
router.get("/my-complaints", protect, getMyComplaints);

// Caretaker routes
router.patch("/:id/manage", protect, manageComplaint);

export default router;
