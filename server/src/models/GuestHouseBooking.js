import mongoose from "mongoose";

const GuestHouseBookingSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel"
  },

  wardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  guestName: String,
  gender: String,
  address: String,
  contactNumber: String,

  numGuests: Number,
  numRooms: Number,
  occupancyType: String, // e.g., "1 single, 1 double"
  roomToBeBooked: String, // e.g., "Executive Suite - Cat-B Rs.3500/-"
  paymentByGuest: Boolean,

  arrivalDate: Date,
  arrivalTime: String,
  departureDate: Date,
  departureTime: String,

  purpose: String,

  // Prefetched Applicant Data
  applicantName: String,
  applicantDepartment: String,
  applicantEntryNo: String,
  applicantMobileNo: String,

  status: {
    type: String,
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("GuestHouseBooking", GuestHouseBookingSchema);