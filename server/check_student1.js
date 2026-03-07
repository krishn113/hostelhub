import mongoose from "mongoose";

const MONGO_URI = 'mongodb+srv://yashasvichaudhary7985_db_user:PnKphKKZY9kSBdVd@cluster0.djq6oeo.mongodb.net/?appName=Cluster0';
const S = new mongoose.Schema({
    name: String,
    email: String,
    roomNumber: String,
    hostelId: mongoose.Schema.Types.ObjectId,
    role: String
}, { timestamps: true });

const User = mongoose.model('User', S);

const check = async () => {
  await mongoose.connect(MONGO_URI);
  const student = await User.findOne({ 
      $or: [
          { name: /Student1/i },
          { email: /Student1/i }
      ]
  }).lean();
  
  if (student) {
      console.log("=== STUDENT 1 STATE IN DB ===");
      console.log(JSON.stringify({
          name: student.name,
          email: student.email,
          roomNumber: student.roomNumber || "NOT ASSIGNED",
          hostelId: student.hostelId ? student.hostelId.toString() : "NULL",
          lastUpdated: student.updatedAt
      }, null, 2));
  } else {
      console.log("Student1 not found in DB at all!");
  }
  
  mongoose.disconnect();
};

check().catch(console.error);
