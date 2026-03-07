import express from "express";
import multer from "multer";
import fs from "fs";
import { createNotice, getNotices, deleteNotice, updateNotice } from "../controllers/noticeController.js";
import { protect as auth, allowRoles as authorize } from "../middleware/auth.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure where to save uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), 
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });
router.get("/", auth, getNotices);
// Use upload.array("attachments") to match the frontend key
router.post("/", auth, authorize("caretaker", "warden", "admin", "student"), upload.array("attachments"), createNotice);

// Add missing patch and delete routes
router.patch("/:id", auth, authorize("caretaker", "warden", "admin", "student"), updateNotice);
router.delete("/:id", auth, authorize("caretaker", "warden", "admin", "student"), deleteNotice);

export default router;