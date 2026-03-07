import Notice from "../models/Notice.js";

export const createNotice = async (req, res) => {
    try {
        const { title, content, links, attachments, category, isPinned } = req.body;
        
        let parsedLinks = [];
        if (req.body.links) {
            try {
                parsedLinks = JSON.parse(req.body.links);
            } catch (e) {
                parsedLinks = [];
            }
        }

        const fileAttachments = req.files ? req.files.map(file => ({
            fileName: file.originalname,
            fileType: file.mimetype,
            // If storing locally, save the path. If using cloud storage, use the cloud URL.
            url: `/uploads/${file.filename}` 
        })) : [];

        // Author and Hostel are pulled from the 'auth' middleware
        const newNotice = new Notice({
            title,
            content,
            author: req.user._id,
            hostel: req.user.hostelId || null, // Allow unassigned caretaker to create notice
            links: parsedLinks,
            attachments: fileAttachments,
            category: category || "Events",
            isPinned: isPinned === 'true' || isPinned === true,
        });

        await newNotice.save();
        res.status(201).json({ msg: "Notice posted successfully", notice: newNotice });
    } catch (error) {
        res.status(500).json({ msg: "Error creating notice", error: error.message });
    }
};

export const getNotices = async (req, res) => {
  try {
    // 1. Log the user to see if hostelId is actually there
    console.log("Fetching notices for user:", req.user);

    // 2. Check if user has a hostelId
    if (!req.user || !req.user.hostelId) {
       // If no hostelId, they should not see any notices 
       // to prevent global leaks to unassigned users.
       return res.json([]);
    }

    // 3. Find notices specifically for this hostel ONLY
    const notices = await Notice.find({ hostel: req.user.hostelId })
      .populate("author", "name") // Optional: gets the name of the caretaker who posted
      .sort({ createdAt: -1 });

    res.status(200).json(notices);
  } catch (error) {
    console.error("GET NOTICES ERROR:", error); // Check your terminal for the red text!
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedNotice = await Notice.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedNotice) return res.status(404).json({ msg: "Notice not found" });
        res.json(updatedNotice);
    } catch (error) {
        res.status(500).json({ msg: "Error updating notice", error: error.message });
    }
};

export const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNotice = await Notice.findByIdAndDelete(id);
        if (!deletedNotice) return res.status(404).json({ msg: "Notice not found" });
        res.json({ msg: "Notice deleted successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting notice", error: error.message });
    }
};