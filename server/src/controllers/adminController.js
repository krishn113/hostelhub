import Hostel from "../models/Hostel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import YearAllocation from "../models/YearAllocation.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- Hostels ---
export const addHostel = async (req, res) => {
  try {

    const { name, type, roomConfigs } = req.body;

    const totalRooms = roomConfigs.reduce(
      (sum, r) => sum + Number(r.rooms), 
      0
    );

    const hostel = await Hostel.create({
      name,
      type,
      roomConfigs,
      totalRooms
    });

    res.json(hostel);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHostel = async (req, res) => {
  try {

    const { name, type, roomConfigs } = req.body;

    const totalRooms = roomConfigs.reduce(
      (sum, r) => sum + Number(r.rooms),
      0
    );

    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        roomConfigs,
        totalRooms
      },
      { new: true }
    );

    res.json(hostel);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Rooms ---
export const addRoom = async (req, res) => {
  try {
    const { hostelId, roomNumber, capacity } = req.body;
    const room = await Room.create({ hostelId, roomNumber, capacity });

    // Update total rooms in Hostel
    await Hostel.findByIdAndUpdate(hostelId, { $inc: { totalRooms: 1 } });

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// massAddRooms removed - rooms are now added during hostel creation

export const getRooms = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const rooms = await Room.find({ hostelId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Allocations (Batch) ---
export const allocateBatch = async (req, res) => {
  try {
    const { year, gender, degreeType, hostelId } = req.body;

    // Upsert allocation rule
    const allocation = await YearAllocation.findOneAndUpdate(
      { year, gender, degreeType },
      { hostelId },
      { upsert: true, new: true }
    );

    res.json({ msg: "Allocation rule saved", allocation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllocations = async (req, res) => {
  try {
    const allocations = await YearAllocation.find().populate("hostelId");
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- Specific Student Allocation ---
export const allocateStudent = async (req, res) => {
  try {
    const { email, hostelId, roomNumber } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { hostelId, roomNumber },
      { new: true }
    );
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Increment occupied count for room (simplified logic, ideally check capacity)
    if (roomNumber) {
      await Room.findOneAndUpdate({ hostelId, roomNumber }, { $inc: { occupiedCount: 1 } });
    }

    res.json({ msg: "Student allocated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, role, hostelId, gender } = req.body;

    if (!["warden", "caretaker"].includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    // generate password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      hostelId,
      gender
    });

    // email credentials
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Hostel Management Login Credentials",
      text: `
Hello ${name},

You have been added as ${role}.

Login:
Email: ${email}
Password: ${rawPassword}

Please login and change your password immediately.

– Hostel Admin
`
    });

    res.json({ msg: "Staff created & email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create staff" });
  }
};

export const updateBatchRule = async (req, res) => {
  await YearAllocation.findByIdAndUpdate(req.params.id, req.body);
  res.json({ msg: "Rule updated" });
};

export const deleteBatchRule = async (req, res) => {
  try {
    await YearAllocation.findByIdAndDelete(req.params.id);
    res.json({ message: "Rule deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {

    const hostels = await Hostel.find();

    let totalRooms = 0;
    let totalCapacity = 0;

    hostels.forEach(h => {
      h.roomConfigs.forEach(rc => {
        totalRooms += rc.rooms;
        totalCapacity += rc.rooms * rc.capacity;
      });
    });

    const totalHostels = hostels.length;

    const occupiedBeds = await User.countDocuments({
      hostelId: { $ne: null },
      role: "student"
    });

    const occupancyRate =
      totalCapacity === 0
        ? 0
        : Math.round((occupiedBeds / totalCapacity) * 100);

    res.json({
      totalHostels,
      totalRooms,
      totalCapacity,
      occupiedBeds,
      occupancyRate
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHostelOccupancy = async (req, res) => {
  try {

    const hostels = await Hostel.find();

    const data = await Promise.all(
      hostels.map(async (h) => {

        let capacity = 0;

        h.roomConfigs.forEach(rc => {
          capacity += rc.rooms * rc.capacity;
        });

        const occupied = await User.countDocuments({
          hostelId: h._id,
          role: "student"
        });

        return {
          name: h.name,
          capacity,
          occupied
        };

      })
    );

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
