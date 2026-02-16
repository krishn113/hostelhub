"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";

// HELPER FUNCTION: Place this OUTSIDE your component
const getCommonSlots = (complaints) => {
  const slotCounts = {};
  
  // Only look at Pending or Scheduled complaints
  complaints
    .filter(c => c.status === "Pending" || c.status === "Scheduled")
    .forEach(c => {
      // Ensure the slot exists to avoid undefined errors
      const slot = c.preferredSlot || "Not Specified";
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });

  // Convert the object { "Mon 2pm": 3 } into a sorted array [{ slot: "Mon 2pm", count: 3 }]
  return Object.entries(slotCounts)
    .map(([slot, count]) => ({ slot, count }))
    .sort((a, b) => b.count - a.count);
};

export default function ComplaintDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
const [floorFilter, setFloorFilter] = useState("All");
const [categoryFilter, setCategoryFilter] = useState("All");
const [statusFilter, setStatusFilter] = useState("All"); 
  const commonSlots = useMemo(() => getCommonSlots(complaints), [complaints]);

  const updateStatus = async (id, action, data = {}) => {
    try {
      await api.patch(`/complaints/${id}/manage`, { action, ...data });
      // Refresh data
    } catch (err) { alert("Action failed"); }
  };

const filteredComplaints = complaints.filter(c => {
  const matchesSearch = c.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.student.roomNumber.toString().includes(searchQuery);
  const matchesFloor = floorFilter === "All" || c.floor.toString() === floorFilter;
  const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
  const matchesStatus = statusFilter === "All" || c.status === statusFilter;

  return matchesSearch && matchesFloor && matchesCategory && matchesStatus;
});
useEffect(() => {
  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints"); // Verify this route matches your backend
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    }
  };
  fetchComplaints();
}, []);

  return (
  <DashboardLayout role="caretaker">
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      
      {/* 1. TOP ANALYSIS REPORT SECTION */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Maintenance Analysis</h1>
        <p className="text-slate-500 font-medium mb-6">Visual breakdown of pending issues across floors.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Electrical", "Plumbing", "Furniture", "Internet"].map((cat) => {
            const pendingInCat = complaints.filter(c => c.category === cat && c.status === "Pending");
            const affectedFloors = [...new Set(pendingInCat.map(c => c.floor))].sort();

            return (
              <div key={cat} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="p-2 bg-slate-100 rounded-xl text-xl">
                    {cat === "Electrical" ? "⚡" : cat === "Plumbing" ? "🚰" : cat === "Furniture" ? "🪑" : "🌐"}
                  </span>
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                    {pendingInCat.length} PENDING
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{cat}</h3>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {affectedFloors.length > 0 ? (
                    affectedFloors.map(f => (
                      <span key={f} className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                        FLOOR {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 italic">No active issues</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* 2. MAIN COMPLAINT FEED (Single Column for Clarity) */}
      <div className="max-w-6xl mx-auto">
  
  {/* SEARCH & FILTER BAR */}
  <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm mb-8 space-y-4">
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search Input */}
      <div className="flex-1 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input 
          type="text"
          placeholder="Search by name, room, or issue..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-4 py-3 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="All">Status: All</option>
          <option value="Pending">Pending</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Resolved">Resolved</option>
        </select>

        {/* Floor Filter */}
        <select 
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-4 py-3 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="All">Floor: All</option>
          <option value="1">Floor 1</option>
          <option value="2">Floor 2</option>
          <option value="3">Floor 3</option>
          <option value="4">Floor 4</option>
        </select>

        {/* Category Filter */}
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-4 py-3 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="All">Category: All</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Furniture">Furniture</option>
          <option value="Internet">Internet</option>
        </select>
      </div>
    </div>
  </div>

  <div className="flex justify-between items-center mb-6 px-4">
      <h2 className="text-xl font-bold text-slate-800">Results ({filteredComplaints.length})</h2>
      <button 
        onClick={() => {setSearchQuery(""); setFloorFilter("All"); setCategoryFilter("All"); setStatusFilter("All");}}
        className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
      >
        Reset Filters
      </button>
  </div>

  {/* RENDER FILTERED COMPLAINTS */}
  <div className="space-y-4">
    {filteredComplaints.length > 0 ? (
      filteredComplaints.map((item) => (
        <div key={item._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center relative overflow-hidden group hover:border-indigo-200 transition-all">
          {/* Minimalist Status Indicator */}
          <div className={`absolute left-0 top-0 h-full w-1.5 ${
            item.status === 'Pending' ? 'bg-amber-400' : 
            item.status === 'Scheduled' ? 'bg-indigo-500' : 'bg-green-500'
          }`} />

          {/* Student Info & Slot */}
          <div className="w-full md:w-48 flex-shrink-0 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Slot</p>
            <p className="text-sm font-black text-indigo-600 mb-3">{item.preferredSlot}</p>
            <div className="flex items-center justify-center md:justify-start gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                  {item.student.name.charAt(0)}
               </div>
               <div className="text-left">
                  <p className="text-xs font-bold text-slate-700 truncate w-24">{item.student.name}</p>
                  <p className="text-[9px] text-slate-400">Room {item.student.roomNumber}</p>
               </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase px-2 py-0.5 bg-indigo-50 rounded-md">
                  Floor {item.floor}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  {item.category}
                </span>
             </div>
             <h3 className="text-lg font-bold text-slate-800 tracking-tight">{item.description}</h3>
          </div>

          {/* Contextual Actions */}
          <div className="w-full md:w-auto flex gap-2">
            {item.status === "Pending" && (
              <>
                <button 
                  onClick={() => {
                    const date = prompt("Schedule technician for:");
                    if(date) updateStatus(item._id, "accept", { technicianDate: date });
                  }}
                  className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                  Schedule
                </button>
              </>
            )}
            {item.status === "Scheduled" && (
              <button 
                onClick={() => updateStatus(item._id, "resolve")}
                className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                Mark Resolved
              </button>
            )}
            {item.status === "Resolved" && (
              <div className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase border border-slate-100">
                Completed
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
        <p className="text-slate-400 font-medium">No complaints match your search criteria.</p>
      </div>
    )}
  </div>
</div>
    </div>
  </DashboardLayout>
);
}