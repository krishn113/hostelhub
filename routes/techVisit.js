import express from "express";
import TechnicianVisit from "../models/TechVisit.js";

const router = express.Router();


// POST visit time (caretaker)
router.post("/", async (req, res) => {
  try {
    const { hostelId, visitTime } = req.body;

    const visit = await TechnicianVisit.findOneAndUpdate(
      { hostel: hostelId },
      { visitTime },
      { new: true, upsert: true }
    );

    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET visit time (student)
router.get("/:hostelId", async (req, res) => {
  try {
    const visit = await TechnicianVisit.findOne({
      hostel: req.params.hostelId
    });

    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;