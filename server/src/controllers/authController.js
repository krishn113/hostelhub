import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure Nodemailer
// In production, these should be in .env
// We'll trust the user has put EMAIL_USER and EMAIL_PASS in .env or will do so.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email.endsWith("@iitrpr.ac.in")) {
      return res.status(400).json({ msg: "Only IIT Ropar email allowed (@iitrpr.ac.in)" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (update if exists or create new)
    await Otp.findOneAndUpdate(
      { email },
      { otp, verified: false, createdAt: Date.now() },
      { upsert: true, new: true }
    );


    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Hostel Management - Your OTP",
      text: `Your OTP for verification is: ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, msg: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ msg: "OTP expired. Request a new one." });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ msg: "Incorrect OTP" });
    }

    record.verified = true;
    await record.save();

    res.json({ msg: "OTP verified successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, year, entryNumber, degreeType, phone, gender } = req.body;

    if (!email.endsWith("@iitrpr.ac.in"))
      return res.status(400).json({ msg: "Only IIT Ropar email allowed" });

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.verified)
      return res.status(400).json({ msg: "Email not verified" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      year,
      entryNumber,
      degreeType,
      phone,
      gender
    });

    await Otp.deleteOne({ email });

    const token = jwt.sign(
      { id: user._id, role: user.role, tv: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    res.json({ msg: "Signup successful", token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role, tv: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, role: user.role });
};

export const forgotPassword = async (req, res) => {
  // Same as sendOtp but maybe different subject/check if user exists first
  try {
    const { email } = req.body;
    if (!email.endsWith("@iitrpr.ac.in"))
      return res.status(400).json({ msg: "Invalid email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Reuse sendOtp logic or call it? For now, implementing customized logic
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate(
      { email },
      { otp, verified: false, createdAt: Date.now() },
      { upsert: true, new: true }
    );


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Hostel Management - Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. Valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ msg: "OTP not found" });
    }

    if (record.otp.toString() !== otp.toString()) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.tokenVersion = Date.now();
    await user.save();

    await Otp.deleteOne({ email });

    res.json({ msg: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("hostelId", "name type");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      ...user.toObject(),
      hostelName: user.hostelId ? user.hostelId.name : null,
      hostelType: user.hostelId ? user.hostelId.type : null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile info" });
  }
};

