import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
  category: { 
    type: String, 
    enum: ["Electrical", "Plumbing", "Furniture", "Internet", "Cleaning", "Other"],
    required: true 
  },
  floor: { type: Number, required: true }, // Extracted from room number or student info
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Scheduled", "Resolved", "Rejected"], 
    default: "Pending" 
  },
  preferredSlot: { type: String, required: true }, // e.g., "Monday 2pm-4pm"
  technicianDate: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);