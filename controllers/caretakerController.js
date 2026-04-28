import User from "../models/User.js";
import XLSX from "xlsx";
import Room from "../models/Room.js";
import YearAllocation from "../models/YearAllocation.js";
import fs from "fs";
import path from "path";

const logFile = "upload_debug.log";
let runtimeLogs = [];

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  runtimeLogs.push(line);
  try {
    fs.appendFileSync(logFile, line + "\n");
  } catch (e) {
    // Ignore log file write errors
  }
};

export const getAllStudents = async (req, res) => {
  try {
    if (!req.user || !req.user.hostelId) {
      return res.status(403).json({ msg: "No hostel assigned to this caretaker" });
    }

    // 1. Fetch Admin Rules pointing to this Caretaker's Hostel
    const rules = await YearAllocation.find({ hostelId: req.user.hostelId });

    // 2. Build an OR query to find students matching ANY of the rules
    // (A student matches if their year, gender, and degreeType match the rule AND they are unassigned)
    const ruleQueries = rules.map(rule => {
      const q = {
        role: "student",
        year: rule.year,
        // Use case-insensitive regex for robust matching (e.g. Female matches female)
        gender: { $regex: new RegExp(`^${rule.gender}$`, "i") }
      };
      if (rule.degreeType && rule.degreeType !== "All") {
        const dt = rule.degreeType.replace(/[^a-zA-Z0-9]/g, '');
        const regexStr = dt.split('').join('[^a-zA-Z0-9]*');
        q.degreeType = { $regex: new RegExp(`^${regexStr}$`, "i") };
      }
      return q;
    });

    // 3. Find students explicitly assigned to this hostel OR matching the rules
    // Note: { $or: [{ hostelId: null }, { hostelId: { $exists: false } }] } correctly
    // catches BOTH students where hostelId is null AND where the field is absent.
    const query = {
      $or: [
        { hostelId: req.user.hostelId, role: "student" }, // Explicitly Assigned
        ...(ruleQueries.length > 0 ? [{
          $or: ruleQueries,
          $and: [{ $or: [{ hostelId: null }, { hostelId: { $exists: false } }] }]
        }] : [])
      ]
    };

    const students = await User.find(query).select("-password").sort({ name: 1 });
    log(`[getAllStudents] Fetched ${students.length} students for hostel ${req.user.hostelId}`);
    students.forEach(s => log(`  -> ${s.name} (${s.email}) room: ${s.roomNumber}`));

    log(`[getAllStudents] Fetched ${students.length} students for hostel ${req.user.hostelId}`);

    // Clear logs periodically so we only see the latest
    if (runtimeLogs.length > 50) runtimeLogs = runtimeLogs.slice(-20);

    res.json({ students, debugLog: runtimeLogs });
  } catch (error) {
    console.error("Fetch Students Error:", error);
    res.status(500).json({ msg: "Failed to fetch student list", debugLog: runtimeLogs });
  }
};

export const uploadRooms = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const wb = XLSX.read(req.file.buffer);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    log(`[uploadRooms] Processing ${rows.length} rows. Caretaker: ${req.user.email}, HostelId: ${req.user.hostelId}`);

    // Process all rows in parallel for speed
    await Promise.all(rows.map(async (r) => {
      const email = (r.Email || r.email || "").toString().trim().toLowerCase();
      const roomVal = (r.RoomNumber || r.roomNumber);

      log(`[uploadRooms] Row: email=${email}, room=${roomVal}`);

      // 1. Find the user by email (direct match since email is lowercase in DB)
      const user = await User.findOne({ email: email });

      if (user && roomVal) {
        const roomNum = roomVal.toString();
        const floorNum = (r.FloorNumber || r.floorNumber || "").toString();
        log(`[uploadRooms] Matched user ${user.name} (${user._id}), assigning room ${roomNum}, floor ${floorNum}`);

        // 2. Update the Room model (Mapping student to a room in this hostel)
        await Room.findOneAndUpdate(
          { hostelId: req.user.hostelId, roomNumber: roomNum },
          { studentId: user._id },
          { upsert: true }
        );

        // 3. Update the User model
        await User.findByIdAndUpdate(user._id, {
          roomNumber: roomNum,
          floorNumber: floorNum,
          hostelId: req.user.hostelId
        });
        log(`[uploadRooms] Success for ${user.email} (Room: ${roomNum}, Floor: ${floorNum})`);
      } else {
        log(`[uploadRooms] No student or room found for Row: ${JSON.stringify(r)}`);
      }
    }));

    res.json({
      msg: `Rooms updated for ${rows.length} records processed`,
      debugLog: runtimeLogs
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ msg: "Failed to process excel file", debugLog: runtimeLogs });
  }
};

export const downloadStudents = async (req, res) => {
  try {
    const rules = await YearAllocation.find({ hostelId: req.user.hostelId });

    const ruleQueries = rules.map(rule => {
      const q = {
        role: "student",
        year: rule.year,
        // Use case-insensitive regex for robust matching
        gender: { $regex: new RegExp(`^${rule.gender}$`, "i") }
      };
      if (rule.degreeType && rule.degreeType !== "All") {
        const dt = rule.degreeType.replace(/[^a-zA-Z0-9]/g, '');
        const regexStr = dt.split('').join('[^a-zA-Z0-9]*');
        q.degreeType = { $regex: new RegExp(`^${regexStr}$`, "i") };
      }
      return q;
    });

    const query = {
      $or: [
        { hostelId: req.user.hostelId, role: "student" },
        ...(ruleQueries.length > 0 ? [{
          $or: ruleQueries,
          $and: [{ $or: [{ hostelId: null }, { hostelId: { $exists: false } }] }]
        }] : [])
      ]
    };

    const users = await User.find(query).select("name email entryNumber roomNumber floorNumber");

    log(`[downloadStudents] EXPORT_V3_START | Found ${users.length} students.`);

    // Use AOA (Array of Arrays) for absolute control over the header row
    const header = ["Name", "Email", "EntryNumber", "RoomNumber", "FloorNumber"];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.entryNumber || "N/A",
      u.roomNumber || "",
      u.floorNumber || ""
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=v3_backend_final.xlsx");
    res.setHeader("X-Backend-Version", "3.1.0");

    res.send(buf);
  } catch (error) {
    res.status(500).json({ msg: "Error generating student list" });
  }
};

export const getRoomStats = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;

    const rules = await YearAllocation.find({ hostelId });
    const ruleQueries = rules.map(rule => {
      const q = {
        role: "student",
        year: rule.year,
        gender: { $regex: new RegExp(`^${rule.gender}$`, "i") }
      };
      if (rule.degreeType && rule.degreeType !== "All") {
        const dt = rule.degreeType.replace(/[^a-zA-Z0-9]/g, '');
        const regexStr = dt.split('').join('[^a-zA-Z0-9]*');
        q.degreeType = { $regex: new RegExp(`^${regexStr}$`, "i") };
      }
      return q;
    });

    const query = {
      $or: [
        { hostelId: hostelId, role: "student" },
        ...(ruleQueries.length > 0 ? [{
          $or: ruleQueries,
          $and: [{ $or: [{ hostelId: null }, { hostelId: { $exists: false } }] }]
        }] : [])
      ]
    };

    // 1. Get total students in this hostel (assigned + rule matched)
    const totalStudents = await User.countDocuments(query);

    // 2. Get room stats
    // We assume your Room model has 'hostelId' and 'studentId'
    const rooms = await Room.find({ hostelId });

    const occupiedRooms = rooms.filter(r => r.studentId).length;
    const totalRooms = rooms.length; // This depends on your Room initialization logic

    res.json({
      totalStudents,
      occupiedRooms,
      totalRooms,
      emptyRooms: totalRooms - occupiedRooms,
      occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching room stats" });
  }
};

import HostelLeaving from "../models/HostelLeaving.js";
import GuestHouseBooking from "../models/GuestHouseBooking.js";

export const getHostelLeavingForms = async (req, res) => {
  try {
    const forms = await HostelLeaving.find({ hostelId: req.user.hostelId })
      .populate("studentId", "name email entryNumber")
      .sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error("Error fetching hostel leaving forms:", error);
    res.status(500).json({ error: "Failed to fetch leaving forms" });
  }
};

export const getGuestHouseForms = async (req, res) => {
  try {
    const forms = await GuestHouseBooking.find({ hostelId: req.user.hostelId })
      .populate("studentId", "name email entryNumber")
      .sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error("Error fetching guesthouse forms:", error);
    res.status(500).json({ error: "Failed to fetch guesthouse forms" });
  }
};

export const updateHostelLeavingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const form = await HostelLeaving.findOneAndUpdate(
      { _id: id, hostelId: req.user.hostelId },
      { status },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json({ message: `Form ${status.toLowerCase()} successfully`, form });
  } catch (error) {
    console.error("Error updating hostel leaving status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const updateGuestHouseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const form = await GuestHouseBooking.findOneAndUpdate(
      { _id: id, hostelId: req.user.hostelId },
      { status },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json({ message: `Booking ${status.toLowerCase()} successfully`, form });
  } catch (error) {
    console.error("Error updating guesthouse status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const updateStudentRoom = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { roomNumber } = req.body;
    const hostelId = req.user.hostelId;

    if (!hostelId) {
      return res.status(403).json({ msg: "No hostel assigned to this caretaker" });
    }

    if (!roomNumber) {
      return res.status(400).json({ msg: "Room number is required" });
    }

    const roomNum = roomNumber.toString().trim();
    // Logic: if 006 -> G else digit 1
    const floorNum = roomNum[0] === '0' ? 'G' : roomNum[0];

    // Find the user to ensure they exist
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ msg: "Student not found" });
    }

    log(`[updateStudentRoom] Caretaker ${req.user.email} updating user ${user.name} (${user._id}) to room ${roomNum}, floor ${floorNum}`);

    // Update the Room model (Mapping student to a room in this hostel)
    // If the room doesn't exist, create it. If it does, update the occupant.
    await Room.findOneAndUpdate(
      { hostelId: hostelId, roomNumber: roomNum },
      { studentId: user._id },
      { upsert: true }
    );

    // Update the User model
    await User.findByIdAndUpdate(user._id, {
      roomNumber: roomNum,
      floorNumber: floorNum,
      hostelId: hostelId
    });

    res.json({ msg: "Room updated successfully", roomNumber: roomNum, floorNumber: floorNum });
  } catch (error) {
    console.error("Update Student Room Error:", error);
    res.status(500).json({ msg: "Failed to update room" });
  }
};