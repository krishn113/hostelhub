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
            url: file.path 
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
    const { hostel } = req.query;
    
    let query = {};

    if (hostel) {
      query = { hostel: { $in: [hostel, null] } };
    } else if (req.user) {
      if (req.user.role === 'admin') {
        query = {}; // Admin sees all notices
      } else if (req.user.hostelId) {
        query = { hostel: { $in: [req.user.hostelId, null] } };
      } else {
        query = { hostel: null };
      }
    } else {
      query = { hostel: null };
    }

    const notices = await Notice.find(query)
      .select("title content category isPinned createdAt attachments links author") // include author
      .populate("author", "name role")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean(); // 🔥 important

    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
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