import mongoose from "mongoose";

const hostelLeavingSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel"
  },

  reason: String,

  leavingDate: Date,

  returnDate: Date,

  status: {
    type: String,
    default: "Pending"
  }

},{
  timestamps:true
});

export default mongoose.model("HostelLeaving", hostelLeavingSchema);