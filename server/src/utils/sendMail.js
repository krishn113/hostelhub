import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    to: email,
    subject: "OTP for Hostel Portal",
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`
  });
};
