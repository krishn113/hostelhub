import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Electrical", "Plumbing", "Furniture", "Internet", "Cleaning", "Other"],
    required: true 
  },
  floor: { type: Number, required: true }, // Extracted from room number or student info
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Scheduled", "In Progress", "Resolved", "Rejected"],
    default: "Pending" 
  },
  attachments: [{ type: String }],
  technicianDate: { type: Date },
  // Communication Loop & History Tracking
  updates: [{
    status: String,
    message: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }],
  rejectionReason: { type: String },
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);