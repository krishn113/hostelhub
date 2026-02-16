import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  index: true
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["student","caretaker","warden","admin"], default: "student" },
  year: String,
  entryNumber: String,
  degreeType: String,
    phone: {
    type: String,
    match: /^[0-9]{10}$/
  },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
  roomNumber: String
},{ timestamps:true });

export default mongoose.model("User", userSchema);
