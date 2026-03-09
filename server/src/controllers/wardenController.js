import GuestHouseBooking from "../models/GuestHouseBooking.js";

export const getGuestHouseForms = async (req, res) => {
  try {
    const forms = await GuestHouseBooking.find()
      .populate("studentId", "name email entryNumber")
      .sort({ createdAt: -1 });

    res.json(forms);
  } catch (error) {
    console.error("Error fetching warden guesthouse forms:", error);
    res.status(500).json({ error: "Failed to fetch guesthouse forms" });
  }
};
