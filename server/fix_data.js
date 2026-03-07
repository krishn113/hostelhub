import mongoose from "mongoose";

const MONGO_URI = 'mongodb+srv://yashasvichaudhary7985_db_user:PnKphKKZY9kSBdVd@cluster0.djq6oeo.mongodb.net/?appName=Cluster0';
const UserSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const YearAllocationSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const User = mongoose.model('User', UserSchema);
const YearAllocation = mongoose.model('YearAllocation', YearAllocationSchema);

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // FIX 1: Set gender for the known student ID from the debug output
  const krishnaId = "69935e8116941d1b02438eb0";
  const krishnaFix = await User.updateOne(
    { _id: new mongoose.Types.ObjectId(krishnaId) },
    { $set: { gender: "Female" } }
  );
  console.log(`Fix1 - Set Krishna gender to Female: matched=${krishnaFix.matchedCount}, modified=${krishnaFix.modifiedCount}`);

  // FIX 2: Fix the rule to point to Brahmaputra Girls hostel
  // Currently: 69ab0e386c440faeab091e39 (Brahmaputra Boys) 
  // Correct:   69ab0e4e6c440faeab091e3e (Brahmaputra Girls)
  const ruleFix = await YearAllocation.updateMany(
    { hostelId: new mongoose.Types.ObjectId("69ab0e386c440faeab091e39"), gender: "Female" },
    { $set: { hostelId: new mongoose.Types.ObjectId("69ab0e4e6c440faeab091e3e") } }
  );
  console.log(`Fix2 - Updated rule hostelId to Brahmaputra Girls: matched=${ruleFix.matchedCount}, modified=${ruleFix.modifiedCount}`);

  // Verify
  const krishna = await User.findById(krishnaId, { password: 0 }).lean();
  const rules = await YearAllocation.find().lean();
  
  console.log("\n--- After Fix ---");
  console.log("Krishna gender:", krishna.gender, "| hostelId:", krishna.hostelId);
  rules.forEach(r => console.log(`Rule: year=${r.year} gender=${r.gender} degree=${r.degreeType} hostelId=${r.hostelId}`));

  mongoose.disconnect();
};

run().catch(e => { console.error("Error:", e.message); process.exit(1); });
