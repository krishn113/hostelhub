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
  roomType: String,

  arrivalDate: Date,
  departureDate: Date,

  purpose: String,

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