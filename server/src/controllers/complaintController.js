import Complaint from "../models/Complaint.js";
import YearAllocation from "../models/YearAllocation.js";
import User from "../models/User.js"

// FIX CREATE COMPLAINT
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, type, isUrgent, hostelId } = req.body;
    
    const newComplaint = new Complaint({
      student: req.user._id,
      hostelId,
      title,
      description,
      category,
      type,
      isUrgent,
      // REQUIREMENT: Creator automatically upvotes General complaints
      upvotes: type === "General" ? [req.user._id] : [],
      upvoteCount: type === "General" ? 1 : 0,
      timeline: { raisedAt: new Date() }
    });

    await newComplaint.save();
    res.status(201).json({ message: "Complaint raised successfully", complaint: newComplaint });
  } catch (error) {
    res.status(500).json({ message: "Error creating complaint" });
  }
};
// FETCH COMPLAINTS
// controllers/complaintController.js
export const getMyComplaints = async (req, res) => {
  try {
    const studentId = req.user._id;
    const hostelId = req.user.hostelId;

    // If student isn't assigned a hostel yet, only show their personal room complaints
    const query = hostelId 
      ? { $or: [{ student: studentId }, { type: "General", hostelId: hostelId }] }
      : { student: studentId };

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Fetch Error:", error.message);
    res.status(500).json({ message: "Failed to load complaints" });
  }
};

export const toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // REQUIREMENT: Only allow upvoting for General complaints
    if (complaint.type !== "General") {
      return res.status(400).json({ message: "Only general complaints can be upvoted" });
    }

    const hasAlreadyVoted = complaint.upvotes.some(v => v.toString() === userId);

    if (hasAlreadyVoted) {
      return res.status(400).json({ message: "You have already voted for this issue" });
    }

    // REQUIREMENT: Add vote and save (No toggle/remove)
    complaint.upvotes.push(req.user._id);
    complaint.upvoteCount = complaint.upvotes.length;
    
    await complaint.save();

    res.status(200).json({ 
      message: "Upvote recorded", 
      upvoteCount: complaint.upvoteCount,
      hasUpvoted: true 
    });
  } catch (error) {
    console.error("Upvote Error:", error.message);
    res.status(500).json({ message: "Server error during upvote" });
  }
};

export const getCaretakerComplaints = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Base query: only complaints for this caretaker's hostel
    let query = { hostelId: req.user.hostelId };

    // If a date is provided (for the Schedule tab), 
    // we might want to filter by scheduledDate or raisedAt
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Example: find complaints created on this date 
      // OR scheduled for this date (adjust based on your schema)
      // query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const complaints = await Complaint.find(query)
      .populate("student", "name roomNo") // Crucial for the Card UI
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Error fetching caretaker data", error: error.message });
  }
};

export const bulkUpdateComplaints = async (req, res) => {
  try {
    const { ids, proposedDate } = req.body;
    const pDate = new Date(proposedDate);

    const updatePromises = ids.map(async (id) => {
      const complaint = await Complaint.findById(id);
      if (!complaint) return null;

      if (complaint.type === "General") {
        // GENERAL: 3-Step Flow (Raised -> Scheduled)
        complaint.status = "Scheduled";
        complaint.proposedDate = pDate;
        
        // Use the schema's freeSlots to "paint" the whole day (9AM-6PM)
        complaint.freeSlots = [{ startTime: "09:00", endTime: "18:00" }];
        
        // Update schema timeline
        complaint.timeline.scheduledAt = new Date();
      } else {
        // ROOM: 4-Step Flow (Raised -> Get Slot)
        complaint.status = "Get Slot";
        complaint.proposedDate = pDate;
        complaint.timeline.slotsRequestedAt = new Date();
      }
      return complaint.save();
    });

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Complaints updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Bulk Update Failed" });
  }
};

export const submitStudentSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { freeSlots } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Prevent students from editing slots for General issues 
    // (since these are handled by the caretaker/system)
    if (complaint.type === "General") {
      return res.status(403).json({ message: "General complaints do not require student slot submission." });
    }

    complaint.freeSlots = freeSlots;
    await complaint.save();

    res.status(200).json({ message: "Availability confirmed", complaint });
  } catch (error) {
    res.status(500).json({ message: "Error saving slots", error: error.message });
  }
};

export const scheduleVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.body; // e.g., { start: "10:00", end: "10:30" }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Not found" });

    complaint.status = "Scheduled";
    complaint.scheduledVisit = { start, end };
    complaint.timeline.scheduledAt = new Date();
    
    await complaint.save();
    res.status(200).json({ message: "Visit scheduled", complaint });
  } catch (error) {
    res.status(500).json({ message: "Scheduling failed", error: error.message });
  }
};

export const resolveOrReset = async (req, res) => {
  try {
    const { id } = req.params;
    const { isResolved } = req.body; // true = Resolved, false = Reset to Raised

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Not found" });

    if (isResolved) {
      complaint.status = "Resolved";
      complaint.timeline.resolvedAt = new Date();
    } else {
      // RESET LOGIC: Back to beginning
      complaint.status = "Raised";
      complaint.freeSlots = []; // Clear painted slots
      complaint.scheduledVisit = undefined; // Clear visit
      // Keep proposedDate or clear it based on preference
    }

    await complaint.save();
    res.status(200).json({ message: isResolved ? "Resolved" : "Reset", complaint });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

export const quickResolve = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "Resolved";
    complaint.timeline.resolvedAt = new Date();
    
    // Also clear any scheduled visits if they existed
    complaint.scheduledVisit = undefined;

    await complaint.save();
    res.status(200).json({ message: "Resolved successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Resolve failed" });
  }
};

export const getStudentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch student details using your specific schema fields
    // mapping entryNumber, roomNumber, etc.
    const student = await User.findById(id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Fetch all complaints by this student
    // We sort by createdAt: -1 (newest first)
    const complaints = await Complaint.find({ student: id })
      .sort({ createdAt: -1 });

    // 3. Format history for the Modal
    // We extract the timeline dates so the frontend can show 'Raised' and 'Resolved' dates
    const formattedHistory = complaints.map(c => ({
      title: c.title,
      category: c.category,
      status: c.status,
      createdAt: c.createdAt, // fallback to timestamps
      date: c.timeline?.raisedAt || c.createdAt,
      timeline: c.timeline // contains resolvedAt, scheduledAt, etc.
    }));

    // 4. Combine into one object
    res.status(200).json({
      name: student.name,
      email: student.email,
      phone: student.phone,
      entryNo: student.entryNumber, // Mapping your schema 'entryNumber' to frontend 'entryNo'
      roomNo: student.roomNumber,   // Mapping your schema 'roomNumber' to frontend 'roomNo'
      floor: student.floorNumber,   // Mapping your schema 'floorNumber' to frontend 'floor'
      degree: student.degreeType,   // Mapping your schema 'degreeType' to frontend 'degree'
      year: student.year,
      history: formattedHistory
    });

  } catch (error) {
    console.error("Error in getStudentHistory:", error);
    res.status(500).json({ message: "Server error while fetching history" });
  }
};

// Controller logic
exports.rejectComplaint = async (req, res) => {
  const { reason } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'Rejected', 
      rejectionReason: reason,
      resolvedAt: new Date() 
    },
    { new: true }
  );
  res.status(200).json(complaint);
};