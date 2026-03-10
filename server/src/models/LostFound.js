import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
{
  title: String,
  description: String,
  type: { type: String, enum: ["lost","found"] },

  visibility: { type: String, enum: ["global","hostel"] },

  contactNumber: String,

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel"
  },

  status: {
    type: String,
    default: "active"
  },

  // Auto-expire after 30 days via MongoDB TTL index
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

},
{ timestamps: true }
);

// MongoDB TTL index: deletes document when current time >= expiresAt
lostFoundSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("LostFound", lostFoundSchema);