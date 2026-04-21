import express from "express";
import { createNotice, getNotices, deleteNotice, updateNotice } from "../controllers/noticeController.js";
import { protect as auth, allowRoles as authorize } from "../middleware/auth.js";
import { noticeUpload as upload } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/", auth, getNotices);
// Use upload.array("attachments") to match the frontend key
router.post("/", auth, authorize("caretaker", "warden", "admin", "student"), upload.array("attachments"), createNotice);

// Add missing patch and delete routes
router.patch("/:id", auth, authorize("caretaker", "warden", "admin", "student"), updateNotice);
router.delete("/:id", auth, authorize("caretaker", "warden", "admin", "student"), deleteNotice);

export default router;