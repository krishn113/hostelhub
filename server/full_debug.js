import mongoose from "mongoose";
import fs from "fs";

const MONGO_URI = 'mongodb+srv://yashasvichaudhary7985_db_user:PnKphKKZY9kSBdVd@cluster0.djq6oeo.mongodb.net/?appName=Cluster0';

const UserSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const HostelSchema = new mongoose.Schema({}, { strict: false });
const YearAllocationSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const User = mongoose.model('User', UserSchema);
const Hostel = mongoose.model('Hostel', HostelSchema);
const YearAllocation = mongoose.model('YearAllocation', YearAllocationSchema);

const log = [];
const L = (msg) => { log.push(msg); console.log(msg); };

const run = async () => {
  await mongoose.connect(MONGO_URI);
  L("Connected to MongoDB\n");

  const hostels = await Hostel.find().lean();
  L("=== ALL HOSTELS ===");
  hostels.forEach(h => L(`  id=${h._id} | name=${h.name} | type=${h.type}`));

  const rules = await YearAllocation.find().lean();
  L("\n=== ALL YEAR ALLOCATION RULES ===");
  if (rules.length === 0) L("  NO RULES FOUND!");
  rules.forEach(r => L(`  hostelId=${r.hostelId} | year=${r.year} | gender=${r.gender} | degreeType=${r.degreeType}`));

  const allCaretakers = await User.find({ role: 'caretaker' }).lean();
  L("\n=== ALL CARETAKERS ===");
  allCaretakers.forEach(c => L(`  name=${c.name} | hostelId=${c.hostelId}`));

  const krishna = await User.findOne({ name: /krishna/i }).lean();
  L("\n=== KRISHNA AGARWAL ===");
  if (krishna) {
    L(`  name=${krishna.name}`);
    L(`  year=${krishna.year}`);
    L(`  gender=${krishna.gender}`);
    L(`  degreeType=${krishna.degreeType}`);
    L(`  hostelId=${krishna.hostelId}`);
    L(`  role=${krishna.role}`);
  } else {
    L("  NOT FOUND!");
  }

  if (rules.length > 0 && krishna) {
    const rule = rules[0];
    L("\n=== RULE vs STUDENT COMPARISON ===");
    L(`  rule.hostelId    = ${rule.hostelId}`);
    L(`  rule.year        = ${rule.year}`);
    L(`  rule.gender      = ${rule.gender}`);
    L(`  rule.degreeType  = ${rule.degreeType}`);
    
    const dt = rule.degreeType ? rule.degreeType.replace(/[^a-zA-Z0-9]/g, '') : '';
    const regexStr = dt.split('').join('[^a-zA-Z0-9]*');
    
    const yearMatch = krishna.year === rule.year;
    const genderMatch = new RegExp(`^${rule.gender}$`, 'i').test(krishna.gender);
    const degreeMatch = !rule.degreeType || rule.degreeType === 'All' || new RegExp(`^${regexStr}$`, 'i').test(krishna.degreeType);
    const hostelMissing = krishna.hostelId == null;
    
    L(`\n  year match: "${krishna.year}" === "${rule.year}" => ${yearMatch}`);
    L(`  gender match: "${krishna.gender}" ~= /${rule.gender}/i => ${genderMatch}`);
    L(`  degree match: "${krishna.degreeType}" ~= /${regexStr}/i => ${degreeMatch}`);
    L(`  hostel unassigned: ${hostelMissing}`);
    L(`\n  SHOULD APPEAR: ${yearMatch && genderMatch && degreeMatch && hostelMissing}`);

    // What hostel does the rule point to?
    const ruleHostel = hostels.find(h => h._id.toString() === rule.hostelId.toString());
    L(`\n  Rule points to: ${ruleHostel ? ruleHostel.name : 'UNKNOWN HOSTEL'}`);

    // Which caretaker manages that hostel?
    const ct = allCaretakers.find(c => c.hostelId && c.hostelId.toString() === rule.hostelId.toString());
    L(`  Caretaker for this hostel: ${ct ? ct.name : 'NONE ASSIGNED!'}`);
  }

  fs.writeFileSync('full_debug_result.txt', log.join('\n'), 'utf8');
  L("\nSaved to full_debug_result.txt");
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); });
