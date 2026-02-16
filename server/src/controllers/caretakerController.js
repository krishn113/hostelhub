import User from "../models/User.js";
import XLSX from "xlsx";
import Room from "../models/Room.js";

export const uploadRooms = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const wb = XLSX.read(req.file.buffer);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    // Process all rows in parallel for speed
    await Promise.all(rows.map(async (r) => {
      // 1. Find the user by email provided in Excel
      const user = await User.findOne({ email: r.email });
      
      if (user) {
        // 2. Update the Room model (Mapping student to a room in this hostel)
        // We use req.user.hostelId to ensure caretakers only modify their own hostel rooms
        await Room.findOneAndUpdate(
          { hostelId: req.user.hostelId, roomNumber: r.roomNumber.toString() },
          { studentId: user._id },
          { upsert: true } // Creates the room record if it doesn't exist
        );

        // 3. Update the User model
        await User.findByIdAndUpdate(user._id, { roomNumber: r.roomNumber.toString() });
      }
    }));

    res.json({ msg: `Rooms updated for ${rows.length} records` });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ msg: "Failed to process excel file" });
  }
};

export const downloadStudents = async (req, res) => {
  try {
    // Find students only belonging to the caretaker's hostel
    const users = await User.find({ 
      hostelId: req.user.hostelId, 
      role: "student" 
    }).select("name email entryNumber roomNumber");

    const data = users.map(u => ({
      Name: u.name,
      Email: u.email,
      EntryNumber: u.entryNumber || "N/A",
      RoomNumber: u.roomNumber || "" // Leave blank or current for them to edit
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=hostel_students.xlsx");
    
    res.send(buf);
  } catch (error) {
    res.status(500).json({ msg: "Error generating student list" });
  }
};

export const getRoomStats = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;

    // 1. Get total students in this hostel
    const totalStudents = await User.countDocuments({ hostelId, role: "student" });

    // 2. Get room stats
    // We assume your Room model has 'hostelId' and 'studentId'
    const rooms = await Room.find({ hostelId });
    
    const occupiedRooms = rooms.filter(r => r.studentId).length;
    const totalRooms = rooms.length; // This depends on your Room initialization logic

    res.json({
      totalStudents,
      occupiedRooms,
      emptyRooms: totalRooms - occupiedRooms,
      occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching room stats" });
  }
};