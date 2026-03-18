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
  description: { type: String, required: true },
  isUrgent: { type: Boolean, default: false }, // NEW: Step 1 requirement
  scheduledTime: { type: Number }, // Stores the hour (e.g., 14 for 2 PM)
  resolvedAt: { type: Date },
  status: {
    type: String,
    enum: ["Raised", "Get Slot", "Scheduled", "Resolved"],
    default: "Raised"
  },
  
  // NEW: Caretaker's proposed date for work
  proposedDate: { type: Date }, 
  
  // NEW: Student's selected 1-hour free slots on the proposedDate
  // Example: [9, 10, 14] representing 9AM, 10AM, 2PM
  freeSlots: [{ type: Number }], 

  rejectionReason: { type: String },
  updates: [{
    status: String,
    message: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }],
  isReminderSent: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);