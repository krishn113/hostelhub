import mongoose from "mongoose";

const checkDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hostel-management');
    console.log("Connected to MongoDB.");

    const YearAllocation = mongoose.model('YearAllocation', new mongoose.Schema({ year: String, gender: String, degreeType: String, hostelId: mongoose.Schema.Types.ObjectId }));
    const User = mongoose.model('User', new mongoose.Schema({ name: String, year: String, gender: String, degreeType: String, hostelId: mongoose.Schema.Types.ObjectId }, {strict: false}));

    console.log("\n--- RULES ---");
    const rules = await YearAllocation.find();
    console.log(rules);

    console.log("\n--- TEST USERS ---");
    const users = await User.find({ gender: "female" });
    console.log("female:", users);
    
    const users2 = await User.find({ gender: "Female" });
    console.log("Female:", users2);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

checkDB();
