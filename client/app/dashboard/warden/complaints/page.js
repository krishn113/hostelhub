"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CaretakerHubHeader from "@/components/complaints/CaretakerHubHeader";
import CaretakerTabSwitcher from "@/components/complaints/CaretakerTabSwitcher";
import CaretakerComplaintCard from "@/components/complaints/CaretakerComplaintCard";
import StudentHistoryModal from "@/components/complaints/StudentHistoryModal";
import CaretakerScheduleTable from "@/components/complaints/CaretakerScheduleTable";
import { Calendar as CalendarIcon } from "lucide-react";
import API from "@/lib/api";

export default function CaretakerComplaintsPage() {
  const [activeTab, setActiveTab] = useState("Complaints");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "" });

  // --- 1. DATA FETCHING ---
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/complaints/caretaker?date=${date}`);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [date, activeTab]);

  // --- FILTER LOGIC ---
const filteredComplaints = complaints.filter((c) => {
  const matchesSearch = 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.student?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = filters.category === "" || c.category === filters.category;
  const matchesStatus = filters.status === "" || c.status === filters.status;
  return matchesSearch && matchesCategory && matchesStatus;
});

// 2. Second, Sort the ALREADY filtered results
const displayComplaints = [...filteredComplaints].sort((a, b) => {
  const getPriority = (status) => {
    switch (status) {
      case "Resolved": return 1; // Second last
      case "Rejected": return 2; // Very last
      default: return 0;         // Active
    }
  };

  const priorityA = getPriority(a.status);
  const priorityB = getPriority(b.status);

  if (priorityA !== priorityB) return priorityA - priorityB;
  
  if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
  
  return new Date(b.createdAt) - new Date(a.createdAt);
});

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({ category: "", status: "" });
  };

  // --- SELECTION LOGIC ---
  const handleSelect = (id) => {
    const target = complaints.find(c => c._id === id);
    if (target.status !== "Raised") {
      alert("Only complaints with 'Raised' status can be sent for slot selection.");
      return;
    }
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };



  const handleGetSlots = async () => {
    if (!date || selectedIds.length === 0) return;
    try {
      setLoading(true);
      await API.patch("/complaints/bulk-update", {
        ids: selectedIds,
        proposedDate: date,
        action: "Get Slot"
      });
      setSelectedIds([]);
      await fetchAllData();
      alert("Successfully updated complaints!");
    } catch (err) {
      console.error("Bulk update failed:", err);
      alert("Failed to update complaints.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const onlyRaisedIds = filteredComplaints
        .filter(c => c.status === "Raised")
        .map(c => c._id);
      
      if (onlyRaisedIds.length === 0) {
        alert("No 'Raised' complaints found to select.");
        return;
      }
      setSelectedIds(onlyRaisedIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // app/dashboard/caretaker/complaints/page.js

const handleStudentClick = async (studentId) => {
  if (!studentId) return;
  
  try {
    setLoading(true);
    // CHANGE THIS LINE from /users to /complaints
    const res = await API.get(`/complaints/${studentId}/history`); 
    
    setSelectedStudent(res.data);
    setIsHistoryModalOpen(true);
  } catch (err) {
    console.error("Failed to fetch student profile", err);
  } finally {
    setLoading(false);
  }
};

  const handleSchedule = async (complaintId, hour) => {
    try {
      await API.patch(`/complaints/${complaintId}/manage`, { action: "Scheduled", scheduledTime: Number(hour) });
      fetchAllData();
    } catch (err) { alert("Scheduling failed."); }
  };

  const handleResolve = async (id) => {
    if (!window.confirm("Mark as resolved?")) return;
    try {
      await API.patch(`/complaints/${id}/manage`, { action: "Resolved" });
      fetchAllData();
    } catch (err) { alert("Error resolving."); }
  };

  return (
  <DashboardLayout role="warden" activeTab="complaints">
    {/* Reduced horizontal padding on mobile (px-4) vs desktop (md:px-10) */}
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-6 md:pt-8 pb-20 min-h-screen relative">
      
      {/* TAB SWITCHER - Changed from absolute to relative on mobile to prevent overlapping */}
      {/* Wardens only see Complaints tab */}
      <div className="flex justify-end mb-6 md:mb-0 md:absolute md:top-8 md:right-10 z-30">
         {/* <CaretakerTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      </div>
      
      {/* HEADER SECTION */}
      <div className="transition-all duration-300">
        {activeTab === "Complaints" ? (
          /* Ensure your CaretakerHubHeader component internal layout uses flex-wrap or flex-col on mobile */
          <CaretakerHubHeader 
            selectedCount={selectedIds.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            onClearFilters={handleClearFilters}
            onSelectAll={handleSelectAll}
            isAllSelected={selectedIds.length > 0 && selectedIds.length === filteredComplaints.filter(c => c.status === "Raised").length}
            selectedDate={date} 
            setSelectedDate={setDate}
            onClearSelection={handleClearSelection}
            onGetSlots={handleGetSlots}
            isWarden={true}
          />
        ) : (
          <div className="flex flex-col mb-6 md:mb-10">
            <div className="flex flex-col gap-1">
              {/* Responsive text size: text-2xl on mobile, text-3xl on desktop */}
              <h1 className="text-2xl md:text-3xl font-black text-[#001D4C] uppercase italic tracking-tighter leading-none">
                Maintenance Dispatcher
              </h1>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Manage work orders and schedule technician slots
              </p>
            </div>

            {/* Date Picker Alignment: Left-aligned on mobile, Right-aligned on desktop */}
            <div className="flex justify-start md:justify-end mt-4">
              <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm hover:border-[#001D4C]/20 transition-all w-full md:w-auto justify-between md:justify-start">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">View Schedule For:</span>
                <input 
                  type="date" 
                  className="bg-transparent border-none font-bold text-[11px] uppercase tracking-widest focus:ring-0 text-[#001D4C] cursor-pointer p-0"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="mt-4 md:mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-[#001D4C] rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Syncing Hub...</p>
          </div>
        ) : activeTab === "Complaints" ? (
          /* Grid adjustments: Single column on mobile, 2 on tablets, 3 on desktops */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
            {displayComplaints.length > 0 ? (
              displayComplaints.map((item) => (
                <CaretakerComplaintCard 
                  key={item._id} 
                  complaint={item}
                  isSelected={selectedIds.includes(item._id)}
                  onSelect={handleSelect}
                  onStudentClick={handleStudentClick}
                  onUpdate={fetchAllData}
                  isWarden={true}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                No matching complaints found
              </div>
            )}
          </div>
        ) : (
          /* Wrap table in an overflow container for mobile swiping */
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-[800px] md:min-w-full">
              <CaretakerScheduleTable 
                complaints={complaints} 
                onUpdate={fetchAllData}
                selectedDate={date}
                onStudentClick={handleStudentClick}
                isWarden={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* STUDENT HISTORY MODAL */}
      <StudentHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        studentData={selectedStudent} 
      />
    </div>
  </DashboardLayout>
);
}