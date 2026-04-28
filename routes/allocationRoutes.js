import express from "express";
const router = express.Router();
import { getStudentAllocation } from "../controllers/allocationController.js";

// This creates the endpoint: GET /api/allocations/find
router.get("/find", getStudentAllocation);

export default router;