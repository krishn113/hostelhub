import mongoose from "mongoose";
import fs from "fs";

const MONGO_URI = 'mongodb+srv://yashasvichaudhary7985_db_user:PnKphKKZY9kSBdVd@cluster0.djq6oeo.mongodb.net/?appName=Cluster0';
const S = new mongoose.Schema({}, { strict: false, timestamps: true });
const User = mongoose.model('User', S);
const YASchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const YA = mongoose.model('YearAllocation', YASchema);

const run = async () => {
  await mongoose.connect(MONGO_URI);

  // All students
  const students = await User.find({ role: 'student' }, { password: 0 }).lean();
  console.log("=== ALL STUDENTS ===");
  students.forEach(s => console.log(JSON.stringify({ name: s.name, year: s.year, gender: s.gender, degreeType: s.degreeType, hostelId: s.hostelId ? s.hostelId.toString() : null })));

  // All rules
  const rules = await YA.find().lean();
  console.log("\n=== ALL RULES ===");
  rules.forEach(r => console.log(JSON.stringify({ hostelId: r.hostelId, year: r.year, gender: r.gender, degreeType: r.degreeType })));

  // All caretakers
  const caretakers = await User.find({ role: 'caretaker' }, { password: 0 }).lean();
  console.log("\n=== ALL CARETAKERS ===");
  caretakers.forEach(c => console.log(JSON.stringify({ name: c.name, hostelId: c.hostelId ? c.hostelId.toString() : null })));

  // For each rule, run the exact getAllStudents query
  console.log("\n=== SIMULATION OF getAllStudents() ===");
  for (const rule of rules) {
    const caretaker = caretakers.find(c => c.hostelId && c.hostelId.toString() === rule.hostelId.toString());
    console.log(`\nRule: year=${rule.year}, gender=${rule.gender}, degree=${rule.degreeType}, hostelId=${rule.hostelId}`);
    console.log(`  Caretaker: ${caretaker ? caretaker.name : 'NONE ASSIGNED - this is a problem!'}`);
    
    if (!caretaker) continue;
    
    const dt = rule.degreeType ? rule.degreeType.replace(/[^a-zA-Z0-9]/g, '') : '';
    const regexStr = dt ? dt.split('').join('[^a-zA-Z0-9]*') : null;

    const ruleQuery = {
      role: "student",
      year: rule.year,
      gender: { $regex: new RegExp(`^${rule.gender}$`, "i") },
      ...(regexStr ? { degreeType: { $regex: new RegExp(`^${regexStr}$`, "i") } } : {})
    };

    const fullQuery = {
      $or: [
        { hostelId: rule.hostelId, role: "student" },
        {
          $or: [ruleQuery],
          $and: [{ $or: [{ hostelId: null }, { hostelId: { $exists: false } }] }]
        }
      ]
    };

    const matched = await User.find(fullQuery, { password: 0 }).lean();
    console.log(`  Matched ${matched.length} student(s):`);
    matched.forEach(m => console.log(`    - ${m.name} (year=${m.year}, gender=${m.gender}, degree=${m.degreeType})`));
    
    if (matched.length === 0) {
      console.log(`  No match! Testing each student manually:`);
      for (const s of students) {
        const yearOk = s.year === rule.year;
        const genderOk = rule.gender ? new RegExp(`^${rule.gender}$`, 'i').test(s.gender) : true;
        const degreeOk = !rule.degreeType || rule.degreeType === 'All' || (regexStr && new RegExp(`^${regexStr}$`, 'i').test(s.degreeType));
        const hostelOk = s.hostelId == null;
        console.log(`    ${s.name}: year=${yearOk}(${s.year}), gender=${genderOk}(${s.gender}), degree=${degreeOk}(${s.degreeType}), hostelMissing=${hostelOk}(${s.hostelId})`);
      }
    }
  }

  mongoose.disconnect();
};

run().catch(e => { console.error(e.message); process.exit(1); });
