import Complaint from "../models/Complaint.js";
import YearAllocation from "../models/YearAllocation.js";
import User from "../models/User.js";
import util from 'util';

export const getMyComplaints = async (req, res) => {
  try {
    // We filter by req.user._id (provided by your auth middleware)
    const complaints = await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch complaints" });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { title, category, description, floor } = req.body;
    
    // 1. Auth Check
    if (!req.user) return res.status(401).json({ msg: "Not authorized" });

    // 2. Hostel Lookup
    const { year, gender, degreeType } = req.user;
    const allocation = await YearAllocation.findOne({
      year,
      gender,
      $or: [{ degreeType }, { degreeType: "All" }]
    });

    if (!allocation) {
      return res.status(404).json({ msg: "Hostel assignment not found." });
    }

    // 3. Save Complaint (Notice: attachments is now just an empty array [])
    const newComplaint = new Complaint({
      student: req.user._id,
      hostelId: allocation.hostelId,
      title,
      category,
      description,
      floor: floor || 1,
      attachments: [], // No images for now
      updates: [{
        status: "Pending",
        message: `Complaint registered: ${title}`,
        updatedBy: req.user._id
      }]
    });

    await newComplaint.save();
    res.status(201).json({ msg: "Complaint created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Update your existing manageComplaint to push to the updates array
export const manageComplaint = async (req, res) => {
  const { id } = req.params;
  const { action, technicianDate, reason } = req.body; 

  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ msg: "Not found" });

    let statusUpdate = "";
    let logMessage = "";

    if (action === "accept") {
      statusUpdate = "Scheduled";
      complaint.technicianDate = technicianDate;
      logMessage = "Caretaker has scheduled a technician.";
    } else if (action === "reject") {
      statusUpdate = "Rejected";
      complaint.rejectionReason = reason;
      logMessage = `Rejected: ${reason}`;
    } else if (action === "resolve") {
      statusUpdate = "Resolved";
      logMessage = "Issue has been resolved.";
    }

    complaint.status = statusUpdate;
    
    // Pushing to the new history array we added to the model
    complaint.updates.push({
      status: statusUpdate,
      message: logMessage,
      updatedBy: req.user._id
    });

    await complaint.save();
    res.json({ msg: `Complaint ${action}ed successfully`, complaint });
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
};