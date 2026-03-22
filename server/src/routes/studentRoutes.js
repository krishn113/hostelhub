import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { applyHostelLeaving, bookGuestHouse, getMyForms, createPost, getPosts, markResolved } from "../controllers/studentController.js";
import upload from "../utils/cloudinary.js";

const router = express.Router();

// Apply for hostel leaving
router.post("/hostel-leaving/apply", protect, allowRoles("student"), applyHostelLeaving);

// Apply for guesthouse booking
router.post("/guesthouse/book", protect, allowRoles("student"), bookGuestHouse);

// Get student's forms
router.get("/forms", protect, allowRoles("student"), getMyForms);

router.post("/lost-found", protect, allowRoles("student"), upload.single('image'), createPost);
router.get("/lost-found", protect, allowRoles("student"), getPosts);
router.put("/lost-found/:id/resolve", protect, allowRoles("student"), markResolved);

export default router;
