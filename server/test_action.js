import Complaint from "./src/models/Complaint.js";
import User from "./src/models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const testComplaint = await Complaint.findOne();
        if (!testComplaint) {
            console.log("No complaints found to test with");
            return;
        }

        const caretaker = await User.findOne({ role: "caretaker" });
        if (!caretaker) {
            console.log("No caretaker found");
            return;
        }

        console.log(`Testing with Complaint ID: ${testComplaint._id}, Status: Accepted`);

        const status = "Accepted";
        const logMessage = `Status changed to ${status}`;

        testComplaint.status = status;
        testComplaint.updates.push({
            status: status,
            message: logMessage,
            updatedBy: caretaker._id
        });

        await testComplaint.save();
        console.log("SUCCESS: Complaint saved locally in script");

        // Now move it back to Pending for real testing
        testComplaint.status = "Pending";
        await testComplaint.save();
        console.log("Reset to Pending");

    } catch (err) {
        console.error("FAILURE during local logic test:", err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
