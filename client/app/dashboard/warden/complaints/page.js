"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";

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

  

const filteredComplaints = complaints.filter(c => {
  const matchesSearch = (c.student?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (c.student?.roomNumber?.toString() || "").includes(searchQuery);
  const matchesFloor = floorFilter === "All" || c.floor?.toString() === floorFilter;
  const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
  const matchesStatus = statusFilter === "All" || c.status === statusFilter;

  return matchesSearch && matchesFloor && matchesCategory && matchesStatus;
});
useEffect(() => {
  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints"); // Verify this route matches your backend
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    }
  };
  fetchComplaints();
}, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-400';
      case 'Accepted': return 'bg-blue-400';
      case 'Scheduled': return 'bg-indigo-500';
      case 'In Progress': return 'bg-purple-500';
      case 'Resolved': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  return (
  <DashboardLayout role="warden">
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* 1. TOP ANALYSIS REPORT SECTION */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase italic">Maintenance Control</h1>
        <p className="text-slate-500 font-medium mb-6">Status tracking and status management for all hostel residents.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Electrical", "Plumbing", "Furniture", "Internet"].map((cat) => {
            const pendingInCat = complaints.filter(c => c.category === cat && c.status === "Pending");
            const affectedFloors = [...new Set(pendingInCat.map(c => c.floor))].filter(f => f != null).sort();

            return (
              <div key={cat} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
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

      {/* 2. MAIN COMPLAINT FEED */}
      <div className="max-w-6xl mx-auto">
  
  {/* SEARCH & FILTER BAR */}
  <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm mb-8 space-y-4">
    <div className="flex flex-col md:flex-row gap-4 items-center">
      {/* Search Input */}
      <div className="flex-1 relative w-full">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input 
          type="text"
          placeholder="Search by name, room, or issue..."
          className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-6 py-4 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
        >
          <option value="All">Status: All</option>
          {["Pending", "Accepted", "Scheduled", "In Progress", "Resolved", "Rejected"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select 
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-6 py-4 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
        >
          <option value="All">Floor: All</option>
          {[1,2,3,4].map(f => <option key={f} value={f.toString()}>Floor {f}</option>)}
        </select>

        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-6 py-4 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
        >
          <option value="All">Category: All</option>
          {["Electrical", "Plumbing", "Furniture", "Internet", "Cleaning"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  </div>

  <div className="flex justify-between items-center mb-6 px-4">
      <h2 className="text-xl font-bold text-slate-800">Operational Log ({filteredComplaints.length})</h2>
      <button 
        onClick={() => {setSearchQuery(""); setFloorFilter("All"); setCategoryFilter("All"); setStatusFilter("All");}}
        className="text-[10px] font-black text-indigo-600 uppercase hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
      >
        Clear All Filters
      </button>
  </div>

  {/* RENDER FILTERED COMPLAINTS */}
  <div className="space-y-6">
    {filteredComplaints.length > 0 ? (
      filteredComplaints.map((item) => (
        <div key={item._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center relative overflow-hidden group hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
          
          {/* Minimalist Status Indicator */}
          <div className={`absolute left-0 top-0 h-full w-2 ${getStatusColor(item.status)}`} />

          {/* Student Info & Slot */}
          <div className="w-full md:w-56 flex-shrink-0 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reported By</p>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-black text-slate-600 border border-slate-200 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {item.student?.name?.charAt(0) || '?'}
               </div>
               <div className="text-left">
                  <p className="text-sm font-black text-slate-800 truncate w-32">{item.student?.name || 'Unknown'}</p>
                  <p className="text-[10px] font-bold text-slate-400">Room {item.student?.roomNumber || 'N/A'}</p>
               </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Preferred Time</p>
              <p className="text-xs font-bold text-indigo-600 truncate">{item.preferredSlot || "Anytime"}</p>
            </div>
          </div>

          {/* Problem Description */}
          <div className="flex-1 w-full">
             <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black text-indigo-600 uppercase px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                  Floor {item.floor || 'Unknown'}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {item.category}
                </span>
                <span className={`ml-auto text-xs font-black uppercase px-3 py-1 rounded-xl text-white shadow-md ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
             </div>
             <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">{item.description}</h3>
             
             {item.status === 'Rejected' && item.rejectionReason && (
               <p className="mt-3 text-sm text-red-500 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                 Reason: {item.rejectionReason}
               </p>
             )}

             {item.status === 'Scheduled' && item.technicianDate && (
               <p className="mt-3 text-sm text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                 📅 Scheduled for: {new Date(item.technicianDate).toDateString()}
               </p>
             )}
          </div>

          
        </div>
      ))
    ) : (
      <div className="text-center py-20 bg-white rounded-[4rem] border border-dashed border-slate-200">
        <div className="text-5xl mb-4">📂</div>
        <p className="text-slate-400 font-bold uppercase tracking-widest">No matching logs found</p>
      </div>
    )}
  </div>
</div>
    </div>
  </DashboardLayout>
  );
}