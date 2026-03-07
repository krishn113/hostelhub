import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  getAllStudents,
  uploadRooms,
  downloadStudents,
  getRoomStats,
  getHostelLeavingForms,
  getGuestHouseForms
} from "../controllers/caretakerController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(allowRoles("caretaker"));

router.get("/students", getAllStudents);
router.post("/upload-rooms", upload.single("file"), uploadRooms);
router.get("/download-students", downloadStudents);
router.get("/room-stats", getRoomStats);

// New Routes for Forms
router.get("/forms/hostel-leaving", getHostelLeavingForms);
router.get("/forms/guesthouse", getGuestHouseForms);

export default router;