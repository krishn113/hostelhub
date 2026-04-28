import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ msg: "Not authenticated" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Matches your User.js: "year", "gender", "degreeType"
    const user = await User.findById(decoded.id)
      .select("name role hostelId tokenVersion gender year degreeType"); 

    if (!user) return res.status(401).json({ msg: "User not found" });

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