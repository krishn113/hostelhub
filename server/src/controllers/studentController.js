import HostelLeaving from "../models/HostelLeaving.js";
import GuestHouseBooking from "../models/GuestHouseBooking.js";
import generatePDF from "../utils/generatePDF.js";
import { sendGuestHouseMail } from "../utils/sendMail.js";
import User from "../models/User.js";

// @route POST /api/student/forms/leave OR /api/hostel-leaving/apply
export const applyHostelLeaving = async (req, res) => {
  try {
    const { reason, leavingDate, returnDate } = req.body;

    const application = await HostelLeaving.create({
      studentId: req.user._id,
      hostelId: req.user.hostelId, // Assuming student has a hostelId
      reason,
      leavingDate,
      returnDate
    });

    res.status(201).json({ message: "Hostel leaving application submitted", application });
  } catch (error) {
    console.error("Error applying for hostel leaving:", error);
    res.status(500).json({ error: "Failed to submit hostel leaving application" });
  }
};

// @route POST /api/student/forms/guesthouse OR /api/guesthouse/book
export const bookGuestHouse = async (req, res) => {
  try {
    const data = req.body;
    
    const booking = await GuestHouseBooking.create({
      ...data,
      studentId: req.user._id,
      hostelId: req.user.hostelId // Optional, if linked to a specific hostel
    });

    const pdfPath = await generatePDF(data, booking._id);

    // Get warden email. In a real scenario, you'd fetch the warden from the DB
    // based on hostelId or a global warden role. For now, we will fetch the first warden or use a default.
    const warden = await User.findOne({ role: "warden" });
    const wardenEmail = warden ? warden.email : "warden@college.edu";

    await sendGuestHouseMail(
      wardenEmail,
      data,
      pdfPath
    );

    res.status(201).json({ message: "Guest house booking submitted successfully", booking });
  } catch (error) {
    console.error("Error booking guest house:", error);
    res.status(500).json({ error: "Booking failed" });
  }
};

// @route GET /api/student/forms
export const getMyForms = async (req, res) => {
  try {
    const leavingForms = await HostelLeaving.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    const guestHouseForms = await GuestHouseBooking.find({ studentId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      leavingForms,
      guestHouseForms
    });
  } catch (error) {
    console.error("Error fetching my forms:", error);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};
