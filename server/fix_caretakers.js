import mongoose from "mongoose";
import User from "./src/models/User.js";
import Hostel from "./src/models/Hostel.js";
import Complaint from "./src/models/Complaint.js";
import dotenv from "dotenv";

dotenv.config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const hostels = await Hostel.find();
        const brahmaputra = hostels.find(h => h.name.toUpperCase() === "BRAHMAPUTRA");
        const chenab = hostels.find(h => h.name.toUpperCase() === "CHENAB");

        if (!brahmaputra || !chenab) {
            console.log("Hostels not found in DB.");
            console.log("Available hostels:", hostels.map(h => h.name));
            return;
        }

        console.log(`Brahmaputra ID: ${brahmaputra._id}`);
        console.log(`Chenab ID: ${chenab._id}`);

        // Update Caretaker 1 -> Brahmaputra
        await User.findOneAndUpdate(
            { email: "caretaker1@gmail.com" },
            { hostelId: brahmaputra._id, role: "caretaker" }
        );
        console.log("Updated caretaker1@gmail.com to BRAHMAPUTRA");

        // Update Caretaker 2 -> Chenab (assuming there's a caretaker2)
        await User.findOneAndUpdate(
            { email: "caretaker2@gmail.com" },
            { hostelId: chenab._id, role: "caretaker" }
        );
        console.log("Updated caretaker2@gmail.com to CHENAB");

        // Also ensure complaints have the correct hostelId based on student
        // This is a safety check in case some complaints were created without hostelId
        const students = await User.find({ role: "student" });
        for (const student of students) {
            if (student.hostelId) {
                const res = await Complaint.updateMany(
                    { student: student._id, hostelId: { $exists: false } },
                    { hostelId: student.hostelId }
                );
                if (res.modifiedCount > 0) {
                    console.log(`Updated ${res.modifiedCount} complaints for student ${student.name} with HostelID ${student.hostelId}`);
                }
            }
        }

        console.log("DONE");

    } catch (err) {
        console.error("Fix failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

fix();
