import Complaint from "../models/Complaint.js";

export const getComplaints = async (req, res) => {
  try {
    const filter = {};
    // If the user has a hostelId, only return complaints for that hostel
    if (req.user && req.user.hostelId) {
      filter.hostelId = req.user.hostelId;
    }

    const complaints = await Complaint.find(filter)
      .populate("student", "name roomNumber phone")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    res.status(500).json({ msg: "Failed to fetch complaints" });
  }
};

export const manageComplaint = async (req, res) => {
  const { id } = req.params;
  const { action, technicianDate, reason } = req.body; 

  try {
    let update = {};
    if (action === "accept") {
      update = { status: "Scheduled", technicianDate };
    } else if (action === "reject") {
      update = { status: "Rejected", rejectionReason: reason };
    } else if (action === "resolve") {
      update = { status: "Resolved" };
    }

    const complaint = await Complaint.findByIdAndUpdate(id, update, { new: true });
    res.json({ msg: `Complaint ${action}ed successfully`, complaint });
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
};