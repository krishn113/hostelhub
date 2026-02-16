import Notice from "../models/Notice.js";

export const createNotice = async (req, res) => {
    try {
        const { title, content, links, attachments } = req.body;
        
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
            hostel: req.user.hostelId, // Assigned during Warden/Caretaker creation
            links: parsedLinks,
            attachments: fileAttachments,
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
       // If no hostelId, maybe return all notices or an empty array
       // instead of crashing
       const allNotices = await Notice.find().sort({ createdAt: -1 });
       return res.json(allNotices);
    }

    // 3. Find notices specifically for this hostel
    const notices = await Notice.find({ hostel: req.user.hostelId })
      .populate("author", "name") // Optional: gets the name of the caretaker who posted
      .sort({ createdAt: -1 });

    res.status(200).json(notices);
  } catch (error) {
    console.error("GET NOTICES ERROR:", error); // Check your terminal for the red text!
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};