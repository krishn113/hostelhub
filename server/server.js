import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`RESIDENT_HUB_BACKEND_VERSION: 3.1.0`);
  console.log(`Server running on ${PORT}`);
  console.log(`========================================`);
});
