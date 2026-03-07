import express from "express";
import { manageComplaint, getComplaints } from "../controllers/complaintController.js";
import { protect as auth, allowRoles as authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getComplaints);
router.patch("/:id", auth, authorize("caretaker", "warden", "admin"), manageComplaint);

export default router;
