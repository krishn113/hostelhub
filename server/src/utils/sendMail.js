import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
      <h2>New Guest House Booking Request</h2>

      <p><b>Guest Name:</b> ${bookingData.guestName}</p>
      <p><b>Contact:</b> ${bookingData.contactNumber}</p>
      <p><b>No. of Guests:</b> ${bookingData.numGuests}</p>
      <p><b>No. of Rooms:</b> ${bookingData.numRooms}</p>
      <p><b>Room Type:</b> ${bookingData.roomType}</p>

      <p><b>Arrival:</b> ${bookingData.arrivalDate}</p>
      <p><b>Departure:</b> ${bookingData.departureDate}</p>

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