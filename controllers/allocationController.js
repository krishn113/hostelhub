import YearAllocation from "../models/YearAllocation.js";

import User from "../models/User.js";

export const getStudentAllocation = async (req, res) => {
  try {
    const { year, gender, degreeType } = req.query;
    
    const allocation = await YearAllocation.findOne({ year, gender, degreeType })
      .populate({
        path: "hostelId",
        select: "name"
      })
      .lean();

    if (!allocation) {
      return res.status(404).json({ message: "No hostel allocated" });
    }

    const caretaker = await User.findOne({
      hostelId: allocation.hostelId?._id,
      role: "caretaker"
    })
    .select("email phone")
    .lean();

    res.status(200).json({
      ...allocation,
      caretakerEmail: caretaker?.email,
      caretakerPhone: caretaker?.phone
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};