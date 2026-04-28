const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
  // Prevent webpack from bundling server-only (Express/Mongoose) packages
  serverExternalPackages: [
    "mongoose",
    "bcrypt",
    "jsonwebtoken",
    "nodemailer",
    "express",
    "cors",
    "multer",
    "multer-storage-cloudinary",
    "cloudinary",
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "ejs",
  ],
});