import jwt from "jsonwebtoken";
import User from "../models/User.js";

// middleware/auth.js
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ msg: "Not authenticated" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Explicitly fetch the fields we need for the session
    const user = await User.findById(decoded.id)
      .select("name role hostelId tokenVersion gender year degreeType"); 

    if (!user) return res.status(401).json({ msg: "User not found" });

    // Ensure token version matches (Crucial for the 'Forever Fix')
    // We use 'Number()' to ensure we aren't comparing a string to a number
    if (Number(user.tokenVersion) !== Number(decoded.tv)) {
      return res.status(401).json({ msg: "Session expired. Please login again." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Access denied. Role '${req.user?.role || 'unknown'}' not authorized.` 
      });
    }
    next();
  };
};

// Alias for cleaner route files
export const caretakerOnly = allowRoles("caretaker");