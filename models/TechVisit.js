import mongoose from "mongoose";

const technicianVisitSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true
  },
  visitTime: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.models.TechnicianVisit || mongoose.model("TechnicianVisit", technicianVisitSchema);