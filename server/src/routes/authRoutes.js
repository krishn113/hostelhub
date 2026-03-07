import express from "express";
import { signup, login, sendOtp, verifyOtp, forgotPassword, resetPassword, getMe } from "../controllers/authController.js";
import { protect, allowRoles } from "../middleware/auth.js";
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

export default router;
