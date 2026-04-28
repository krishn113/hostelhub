import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import caretakerRoutes from "./routes/caretakerRoutes.js";
import allocationRoutes from "./routes/allocationRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import wardenRoutes from "./routes/wardenRoutes.js";
import technicianVisitRoutes from "./routes/techVisit.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import guesthouseRoutes from "./routes/guestHouse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

// Global Logger for debugging API calls
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://dep-hostel-management.onrender.com",
  "https://dep-hostel-management-1.onrender.com",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create a directory for PDFs if it doesn't exist (Only in local development)
if (process.env.NODE_ENV !== "production") {
  const pdfDir = path.join(__dirname, "pdf");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
}
app.use("/api/technician-visit", technicianVisitRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/caretaker", caretakerRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/warden", wardenRoutes);

// Retaining this for backwards compatibility if the frontend still hits it directly
app.use("/api/guesthouse", guesthouseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected error occurred",
  });
});

export default app;
