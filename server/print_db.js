import mongoose from "mongoose";
import fs from "fs";

const checkDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://yashasvichaudhary7985_db_user:PnKphKKZY9kSBdVd@cluster0.djq6oeo.mongodb.net/?appName=Cluster0');
    console.log("Connected to MongoDB.");

    const YearAllocation = mongoose.model('YearAllocation', new mongoose.Schema({ year: String, gender: String, degreeType: String, hostelId: mongoose.Schema.Types.ObjectId }));
    const User = mongoose.model('User', new mongoose.Schema({}, {strict: false})); 

    const rules = await YearAllocation.find();
    const users = await User.find({ gender: { $exists: true } }).select("-password");

    fs.writeFileSync('db_dump.json', JSON.stringify({rules, users}, null, 2));
    console.log("Saved to db_dump.json");
    
    process.exit(0);
  } catch(e) {
    console.error("error:", e.message);
    process.exit(1);
  }
}

checkDB();
