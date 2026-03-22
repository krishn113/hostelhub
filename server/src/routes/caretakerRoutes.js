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
  updateGuestHouseStatus,
  updateStudentRoom
} from "../controllers/caretakerController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(allowRoles("caretaker","warden"));

router.get("/students", allowRoles("caretaker", "warden"), getAllStudents);
router.post("/upload-rooms", upload.single("file"), uploadRooms);
router.get("/download-students", allowRoles("caretaker", "warden"), downloadStudents);
router.get("/room-stats", allowRoles("caretaker", "warden"), getRoomStats);

// New Routes for Forms
router.get("/forms/hostel-leaving", allowRoles("caretaker", "warden"), getHostelLeavingForms);
router.get("/forms/guesthouse", allowRoles("caretaker", "warden"), getGuestHouseForms);

router.patch("/forms/hostel-leaving/:id/status", updateHostelLeavingStatus);
router.patch("/forms/guesthouse/:id/status", updateGuestHouseStatus);

// Inline room update
router.put("/student/:studentId/room", allowRoles("caretaker", "warden"), updateStudentRoom);

export default router;