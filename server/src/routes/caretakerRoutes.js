import express from "express";
import multer from "multer";
import {
  uploadRooms, downloadStudents, getRoomStats,
  getAllStudents
} from "../controllers/caretakerController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// Memory storage is better for Vercel/Render deployments
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("spreadsheetml") || file.mimetype.includes("excel")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload only Excel files"), false);
    }
  }
});

// Student Management Routes
router.get("/students", protect, allowRoles("caretaker"), getAllStudents);
router.get("/room-stats", protect, allowRoles("caretaker"), getRoomStats);
router.get("/download-students", protect, allowRoles("caretaker"), downloadStudents);

// Handle Excel Upload
router.post("/upload-rooms", protect, allowRoles("caretaker"), upload.single("file"), uploadRooms);

export default router;