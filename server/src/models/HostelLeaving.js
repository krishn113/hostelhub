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

  nameOfParents: String,

  contactOfParents: String,

  addressDuringLeave: String,

  duration: Number,

  // Prefetched Applicant Data
  applicantName: String,
  applicantDepartment: String,
  applicantEntryNo: String,
  applicantMobileNo: String,

  status: {
    type: String,
    default: "Pending"
  }

},{
  timestamps:true
});

export default mongoose.model("HostelLeaving", hostelLeavingSchema);