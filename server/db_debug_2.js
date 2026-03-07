import mongoose from "mongoose";

const checkDB = async () => {
  try {
    // using the actual cloud db uri
    await mongoose.connect('mongodb+srv://yashasvichaudhary7985_db_user:PnKphKKZY9kSBdVd@cluster0.djq6oeo.mongodb.net/?appName=Cluster0');
    console.log("Connected to MongoDB.");

    const YearAllocation = mongoose.model('YearAllocation', new mongoose.Schema({ year: String, gender: String, degreeType: String, hostelId: mongoose.Schema.Types.ObjectId }));
    const User = mongoose.model('User', new mongoose.Schema({}, {strict: false})); // strict: false to catch any random manually added fields

    console.log("\n--- RULES ---");
    const rules = await YearAllocation.find();
    console.log(rules);

    console.log("\n--- ALL USERS WITH GENDER FIELD ---");
    const users = await User.find({ gender: { $exists: true } }).select("name email year degreeType gender role");
    console.log(users);

    process.exit(0);
  } catch(e) {
    console.error("error:", e.message);
    process.exit(1);
  }
}

checkDB();
