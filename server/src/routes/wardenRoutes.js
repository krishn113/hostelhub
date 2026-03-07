import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { getGuestHouseForms } from "../controllers/wardenController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("warden"));

router.get("/forms/guesthouse", getGuestHouseForms);

export default router;
