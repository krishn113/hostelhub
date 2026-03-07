import Complaint from "./src/models/Complaint.js";
import User from "./src/models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const caretakers = await User.find({ role: "caretaker" });
        console.log("--- Caretakers ---");
        caretakers.forEach(c => {
            console.log(`Name: ${c.name}, Email: ${c.email}, HostelID: ${c.hostelId}`);
        });

        const complaints = await Complaint.find().limit(5);
        console.log("\n--- Recent Complaints ---");
        complaints.forEach(cp => {
            console.log(`Title: ${cp.title}, HostelID: ${cp.hostelId}, StudentID: ${cp.student}`);
        });

        if (caretakers.length > 0) {
            const firstCaretaker = caretakers[0];
            if (firstCaretaker.hostelId) {
                const count = await Complaint.countDocuments({ hostelId: firstCaretaker.hostelId });
                const total = await Complaint.countDocuments();
                console.log(`\nCaretaker ${firstCaretaker.name} with HostelID ${firstCaretaker.hostelId} should see ${count} out of ${total} complaints.`);
            } else {
                console.log(`\nWARNING: Caretaker ${firstCaretaker.name} has no hostelId!`);
            }
        }

    } catch (err) {
        console.error("Debug failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
