import express from "express";
import multer from "multer";
import { createNotice, getNotices } from "../controllers/noticeController.js";
import { protect as auth, allowRoles as authorize } from "../middleware/auth.js";

const router = express.Router();

// Configure where to save uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), 
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });
router.get("/", auth, getNotices);
// Use upload.array("attachments") to match the frontend key
router.post("/", auth, authorize("caretaker", "warden"), upload.array("attachments"), createNotice);

export default router;