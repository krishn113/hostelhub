import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {

  await transporter.sendMail({
    to: email,
    subject: "OTP for Hostel Portal",
    html: `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`
  });

};

export const sendGuestHouseMail = async (wardenEmail, bookingData, pdfPath) => {

  await transporter.sendMail({

    to: wardenEmail,

    subject: "New Guest House Booking Request",

    html: `
      <h4>New Guest House Booking Request</h4>

      <p><b>Applicant Name:</b> ${bookingData.applicantName}</p>
      <p><b>Applicant Department:</b> ${bookingData.applicantDepartment}</p>
      <p><b>Entry No. :</b> ${bookingData.applicantEntryNo}</p>
      <p><b>Mobile No. :</b> ${bookingData.applicantMobileNo}</p>
      <p>Please review the attached document.</p>
    `,

    attachments: [
      {
        filename: "guesthouse-booking.pdf",
        path: pdfPath
      }
    ]

  });

};