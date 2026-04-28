import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  // CORE RELATIONS
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
  
  // CLASSIFICATION
  type: { 
    type: String, 
    enum: ["Room", "General"], 
    default: "Room",
    required: true 
  },
  category: { 
    type: String, 
    enum: ["Electrical", "Plumbing", "Furniture", "WiFi/LAN", "Other"],
    required: true 
  },

  // CONTENT
  title: { type: String, required: true },
  description: { type: String, required: true },
  isUrgent: { type: Boolean, default: false },

  // STATUS & WORKFLOW
  status: {
    type: String,
    enum: ["Raised", "Get Slot", "Scheduled", "Resolved", "Rejected"],
    default: "Raised"
  },

  // CONTINUOUS TIME SYSTEM
  // The caretaker proposes a specific date
  proposedDate: { type: Date }, 
  
  // The student selects random, continuous free ranges (e.g., 10:00 to 11:30)
  freeSlots: [{
    startTime: { type: String }, // e.g., "10:30"
    endTime: { type: String }    // e.g., "12:15"
  }],

  // Final confirmed visit time
  scheduledVisit: {
    start: { type: String },
    end: { type: String }
  },

  // COMMUNITY FEATURES (For General Issues)
  upvotes:{
     type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
     default: []
  },
  
  upvoteCount: { type: Number, default: 0 },

  // LOGISTICS & REMINDERS
  isReminderSent: { type: Boolean, default: false },
  lastReminderAt: { type: Date },
  rejectionReason: { type: String },

  // STEP-BY-STEP TRACKING (Timestamp for every status change)
  timeline: {
    raisedAt: { type: Date, default: Date.now },
    slotsRequestedAt: { type: Date },
    scheduledAt: { type: Date },
    resolvedAt: { type: Date },
    lastRemindedAt: { type: Date }
  },

  // INTERNAL UPDATES LOG
  updates: [{
    status: String,
    message: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true // This covers "createdAt" and "updatedAt" automatically
});

// --- INDEXES & CONSTRAINTS ---

// Ensure 1 person can only raise 1 complaint per category per day
// We create a unique index on (student + category + day_string) in the controller,
// but for the schema, we'll keep it simple and handle the logic in the POST route.

// Efficiency index for upvote sorting
complaintSchema.index({ type: 1, upvoteCount: -1 });

export default mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);