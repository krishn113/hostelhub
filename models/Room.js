import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  // If studentId is null, the room is considered "Empty"
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  type: {
    type: String,
    enum: ["Single", "Double", "Triple"],
    default: "Single",
  },
  lastCleaned: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Ensure a room number is unique within a specific hostel
roomSchema.index({ roomNumber: 1, hostelId: 1 }, { unique: true });

export default mongoose.models.Room || mongoose.model("Room", roomSchema);