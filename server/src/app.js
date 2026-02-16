import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import noticeRoutes from "./routes/noticeRoutes.js";

dotenv.config();

const app = express();


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

app.use("/api/notices", noticeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);


export default app;
