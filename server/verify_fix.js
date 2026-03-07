import mongoose from "mongoose";

const MONGO_URI = 'mongodb+srv://yashasvichaudhary7985_db_user:PnKphKKZY9kSBdVd@cluster0.djq6oeo.mongodb.net/?appName=Cluster0';
const UserSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const YearAllocationSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const User = mongoose.model('User', UserSchema);
const YearAllocation = mongoose.model('YearAllocation', YearAllocationSchema);

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const krishnaId = "69935e8116941d1b02438eb0";
  const krishna = await User.findById(krishnaId).lean();
  if (krishna) {
    console.log("Krishna gender:", krishna.gender);
    console.log("Krishna hostelId:", krishna.hostelId);
  } else {
    console.log("Krishna not found by ID! Trying by email...");
    const k2 = await User.findOne({ email: "2023csb1114@iitrpr.ac.in" }).lean();
    console.log("By email:", k2 ? { gender: k2.gender, hostelId: k2.hostelId } : "NOT FOUND");
  }

  const rules = await YearAllocation.find().lean();
  console.log("\nRules:");
  rules.forEach(r => console.log(`  hostelId=${r.hostelId} year=${r.year} gender=${r.gender} degree=${r.degreeType}`));

  mongoose.disconnect();
};

run().catch(e => { console.error(e.message); process.exit(1); });
