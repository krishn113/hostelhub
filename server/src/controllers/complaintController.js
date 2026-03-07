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
  const { status, reason } = req.body; 

  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ msg: "Not found" });

    // Validate if the new status is one of the allowed ones in the model
    const allowedStatuses = ["Pending", "Accepted", "Scheduled", "In Progress", "Resolved", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    let logMessage = `Status updated to ${status}`;

    if (status === "Rejected" && reason) {
      complaint.rejectionReason = reason;
      logMessage = `Rejected: ${reason}`;
    }

    complaint.status = status;
    
    // Pushing to history array
    complaint.updates.push({
      status: status,
      message: logMessage,
      updatedBy: req.user._id
    });

    await complaint.save();
    res.json({ msg: `Status updated to ${status}`, complaint });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ msg: "Update failed" });
  }
};

export const getComplaints = async (req, res) => {
  try {
    if (!req.user.hostelId) {
      return res.status(403).json({ msg: "Caretaker has no hostel assigned." });
    }

    // Hostel Isolation: Only fetch complaints for the caretaker's hostel
    const complaints = await Complaint.find({ hostelId: req.user.hostelId })
      .populate("student", "name roomNumber")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch complaints" });
  }
};