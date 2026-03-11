import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  getAllStudents,
  uploadRooms,
  downloadStudents,
  getRoomStats,
  getHostelLeavingForms,
  getGuestHouseForms,
  updateHostelLeavingStatus,
  updateGuestHouseStatus
} from "../controllers/caretakerController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.get("/students", allowRoles("caretaker", "warden"), getAllStudents);
router.post("/upload-rooms", upload.single("file"), uploadRooms);
router.get("/download-students", allowRoles("caretaker", "warden"), downloadStudents);
router.get("/room-stats", allowRoles("caretaker", "warden"), getRoomStats);

// New Routes for Forms
router.get("/forms/hostel-leaving", allowRoles("caretaker", "warden"), getHostelLeavingForms);
router.get("/forms/guesthouse", allowRoles("caretaker", "warden"), getGuestHouseForms);

router.patch("/forms/hostel-leaving/:id/status", updateHostelLeavingStatus);
router.patch("/forms/guesthouse/:id/status", updateGuestHouseStatus);

export default router;