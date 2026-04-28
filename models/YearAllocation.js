import mongoose from "mongoose";

const yearAllocationSchema = new mongoose.Schema({
    year: { type: String, required: true }, // e.g., "2022"
    gender: { type: String, enum: ["Male", "Female"], required: true },
    degreeType: { type: String, default: "All" }, // e.g., "B.Tech", "M.Tech", "PhD" or "All"
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true }
}, { timestamps: true });

// Ensure unique combination of year, gender, degreeType
yearAllocationSchema.index({ year: 1, gender: 1, degreeType: 1 }, { unique: true });
export default mongoose.models.YearAllocation || mongoose.model("YearAllocation", yearAllocationSchema);
