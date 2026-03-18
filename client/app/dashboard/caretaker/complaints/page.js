"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { Calendar, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter, CheckSquare, Square } from "lucide-react";

export default function CaretakerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [proposedDate, setProposedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      setComplaints(res.data);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  // --- NEW: SELECT ALL LOGIC ---
  const filteredComplaints = complaints.filter(c => {
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.student?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  })
   .sort((a, b) => {
    // 1. Prioritize Reminders (Pinned at top)
    if (a.isReminderSent && !b.isReminderSent) return -1;
    if (!a.isReminderSent && b.isReminderSent) return 1;

    // 2. Then sort by Newest First
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const isAllSelected = filteredComplaints.length > 0 && 
                        filteredComplaints.every(c => selectedIds.includes(c._id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect only the ones currently in the filtered list
      const filteredIds = filteredComplaints.map(c => c._id);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Add all filtered items to selection (avoiding duplicates)
      const filteredIds = filteredComplaints.map(c => c._id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };
  // -----------------------------

  const handleBulkGetSlot = async () => {
    if (!proposedDate) return alert("Please select a date first");
    try {
      await Promise.all(
        selectedIds.map(id => 
          API.patch(`/complaints/${id}/manage`, { 
            action: "Get Slot", 
            proposedDate 
          })
        )
      );
      alert("Status updated to 'Get Slot' for selected items");
      setSelectedIds([]);
      setProposedDate("");
      fetchComplaints();
    } catch (err) { alert("Bulk action failed"); }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    try {
      await API.patch(`/complaints/${id}/manage`, { action: "Rejected", reason });
      fetchComplaints();
    } catch (err) { console.error(err); }
  };

  return (
    <DashboardLayout role="caretaker" activeTab="complaints">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
        
        {/* Header & Bulk Actions Bar */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Maintenance Hub</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Assign work dates to groups</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Proposed Work Date</label>
              <input 
                type="date" 
                className="bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
              />
            </div>
            <button 
              onClick={handleBulkGetSlot}
              disabled={selectedIds.length === 0 || !proposedDate}
              className="mt-auto bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Get Slots ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* Filters & SELECT ALL Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/50 p-2 rounded-3xl border border-white">
          {/* NEW: Select All Toggle */}
          <button 
            onClick={handleSelectAll}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all border ${
              isAllSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
            }`}
          >
            {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isAllSelected ? "Deselect All" : "Select All Visible"}
            </span>
          </button>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text"
              placeholder="Search by issue or student..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            {["All", "Electrical", "Plumbing", "Furniture", "Internet"].map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  categoryFilter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Feed */}
        <div className="grid gap-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map(c => (
              <div 
                key={c._id} 
                className={`group bg-white p-6 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row items-center gap-6 relative ${
                  selectedIds.includes(c._id) ? 'border-indigo-500 bg-indigo-50/20' : 'border-transparent shadow-sm hover:border-slate-200 shadow-slate-200/50'
                }`}
              >
                <input 
                  type="checkbox"
                  className="w-6 h-6 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  checked={selectedIds.includes(c._id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, c._id]);
                    else setSelectedIds(selectedIds.filter(id => id !== c._id));
                  }}
                />

                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[8px] font-black uppercase px-2 py-1 bg-slate-900 text-white rounded-md tracking-tighter">{c.category}</span>
                    {c.isUrgent && (
                      <span className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-1 bg-rose-500 text-white rounded-md animate-pulse">
                        <AlertTriangle size={10} /> Urgent
                      </span>
                    )}
                    <span className="ml-auto text-[10px] font-black text-slate-400 uppercase">Room {c.student?.roomNumber}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{c.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-1 border-l-2 border-slate-100 pl-3 italic">{c.description}</p>
                </div>

                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div className={`text-center py-2.5 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    c.status === 'Raised' ? 'bg-amber-400 text-white' : 
                    c.status === 'Get Slot' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {c.status}
                  </div>
                  <button 
                    onClick={() => handleReject(c._id)}
                    className="flex-1 md:w-full py-2.5 px-6 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <XCircle size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-black uppercase tracking-[0.2em]">No complaints match filters</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}