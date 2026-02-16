import Complaint from "../models/Complaint.js";

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