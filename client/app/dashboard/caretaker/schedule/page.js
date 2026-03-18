"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { 
  Users, Clock, CheckCircle2, X, 
  MapPin, Phone, AlertCircle, Mail, Hash,
  BookOpen, GraduationCap, Calendar as CalendarIcon
} from "lucide-react";

const WORKING_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

export default function CaretakerSchedule() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({ complaints: [] });
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");

  const fetchStats = async () => {
    try {
      // Hits the updated backend endpoint with population for email/phone/batch
      const res = await API.get(`/complaints/stats?date=${date}`);
      setData(res.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  };

  useEffect(() => { 
    fetchStats(); 
  }, [date]);

  const handleScheduleSingle = async (complaintId, hour) => {
    try {
      // CRITICAL FIX: Matches the unified 'manage' endpoint and uses the 'Scheduled' action
      await API.patch(`/complaints/${complaintId}/manage`, { 
        action: "Scheduled", 
        scheduledTime: Number(hour) // Cast to Number to match Schema
      });
      
      alert(`Scheduled successfully for ${hour > 12 ? hour-12 + ' PM' : hour + ' AM'}!`);
      fetchStats(); // Refresh the table to show the CheckCircle
    } catch (err) {
      console.error("Frontend Schedule Error:", err.response?.data);
      alert(err.response?.data?.msg || "Failed to schedule. Check console.");
    }
  };

  const handleReraise = async (id) => {
    if (!window.confirm("Mark as incomplete? This will reset the status to 'Raised' so you can request new slots.")) return;
    try {
      // Hits the 'manage' endpoint with the 'Re-raised' action we defined in the backend
      await API.patch(`/complaints/${id}/manage`, { action: "Re-raised" });
      fetchStats(); 
      setViewingComplaint(null);
      alert("Status reset to Raised. You can now request new slots from the Hub.");
    } catch (err) { 
      alert("Error resetting status."); 
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm("Mark as resolved? This will move the ticket to history and remove it from the schedule.")) return;
    try {
      await API.patch(`/complaints/${id}/manage`, { action: "Resolved" });
      fetchStats(); 
      setViewingComplaint(null);
      alert("Complaint Resolved successfully.");
    } catch (err) { 
      alert("Error resolving."); 
    }
  };

  // Logic to dynamically generate categories from current data
  const categories = ["All", ...new Set(data.complaints.map(c => c.category))];
  
  // Filter: Removes Resolved items and handles category selection
  const activeSchedule = data.complaints.filter(c => 
    c.status !== "Resolved" && (filterCategory === "All" || c.category === filterCategory)
  );

  return (
    <DashboardLayout role="caretaker" activeTab="schedule">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER & FILTERS */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Maintenance Dispatcher</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage Student Availability & Technical Routes</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto">
              <CalendarIcon size={14} className="text-slate-400 ml-2" />
              <input 
                type="date" 
                className="bg-transparent border-none rounded-xl px-2 py-2 font-bold text-xs focus:ring-0 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  filterCategory === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TIMELINE TABLE */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-8 text-left text-[10px] font-black uppercase text-slate-400 border-r border-slate-100 min-w-[250px]">Resident Details</th>
                  {WORKING_HOURS.map(h => (
                    <th key={h} className="p-4 text-[10px] font-black uppercase text-slate-400 min-w-[100px]">
                      {h > 12 ? `${h-12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                    </th>
                  ))}
                  <th className="p-8 text-[10px] font-black uppercase text-slate-400 border-l border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeSchedule.length > 0 ? activeSchedule.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                    <td className="p-8 border-r border-slate-100 cursor-pointer group" onClick={() => setViewingComplaint(c)}>
                      <span className="bg-indigo-600 text-white text-[7px] font-black px-2 py-1 rounded-md uppercase mb-2 inline-block tracking-tighter">
                        {c.category}
                      </span>
                      <p className="text-sm font-black text-slate-800 uppercase italic group-hover:text-indigo-600 transition-colors">{c.student?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Room {c.student?.roomNumber} • {c.student?.rollNo || 'N/A'}</p>
                    </td>
                    
                    {WORKING_HOURS.map(h => {
                      const isFree = c.freeSlots?.includes(h);
                      // FIXED: This comparison works perfectly with Number(scheduledTime)
                      const isScheduled = c.scheduledTime === h;
                      return (
                        <td key={h} className="p-2 text-center">
                          {isScheduled ? (
                            <div className="h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                              <CheckCircle2 size={18} />
                            </div>
                          ) : isFree ? (
                            <button 
                              onClick={() => handleScheduleSingle(c._id, h)}
                              className="w-full h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all group"
                            >
                              <Clock size={16} className="group-hover:animate-pulse" />
                            </button>
                          ) : (
                            <div className="h-0.5 bg-slate-100 w-6 mx-auto rounded-full" />
                          )}
                        </td>
                      );
                    })}

                    <td className="p-6 border-l border-slate-100">
                      {c.status === "Scheduled" ? (
                        <div className="flex gap-2"> {/* Added a wrapper div for two buttons */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleResolve(c._id); }}
        className="flex-1 bg-emerald-600 text-white px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100"
      >
        Mark Resolved
      </button>
      
      {/* NEW: Re-raise (Cross) Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleReraise(c._id); }}
        title="Job Not Finished / Re-raise"
        className="px-4 py-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
      >
        <X size={16} />
      </button>
    </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Awaiting Slot</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={11} className="p-24 text-center text-slate-300 font-black uppercase italic tracking-widest">
                      No complaints found for this selection
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPREHENSIVE STUDENT & COMPLAINT MODAL */}
        {viewingComplaint && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setViewingComplaint(null)} />
            <div className="relative bg-white w-full max-w-xl h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500">
              
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black uppercase italic text-slate-900 leading-none">Resident Profile</h2>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">Maintenance Case Details</p>
                </div>
                <button onClick={() => setViewingComplaint(null)} className="p-4 bg-slate-100 rounded-3xl hover:bg-rose-100 hover:text-rose-500 transition-all shadow-sm">
                  <X size={24}/>
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto pr-4 flex-1">
                {/* Section 1: Expanded Student Info */}
                <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center font-black text-4xl">
                      {viewingComplaint.student?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-2xl font-black uppercase italic leading-none">{viewingComplaint.student?.name}</p>
                      <p className="text-xs font-bold text-indigo-300 mt-2 uppercase tracking-tighter">Roll No: {viewingComplaint.student?.rollNo || "N/A"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-black">Room Number</label>
                      <p className="text-sm font-bold flex items-center gap-2"><MapPin size={14} className="text-indigo-400" /> Room {viewingComplaint.student?.roomNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-black">Phone Number</label>
                      <p className="text-sm font-bold flex items-center gap-2"><Phone size={14} className="text-indigo-400" /> {viewingComplaint.student?.phone || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-black">Email</label>
                      <p className="text-xs font-bold flex items-center gap-2 truncate"><Mail size={14} className="text-indigo-400" /> {viewingComplaint.student?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-black">Batch & Degree</label>
                      <p className="text-xs font-bold flex items-center gap-2 uppercase tracking-tighter">
                        <GraduationCap size={14} className="text-indigo-400" /> {viewingComplaint.student?.batch} | {viewingComplaint.student?.degree}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 2: Original Complaint */}
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Reported</h3>
                  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">{viewingComplaint.category}</span>
                    </div>
                    <p className="text-xl font-black text-slate-900 uppercase italic mb-4 leading-tight">{viewingComplaint.title}</p>
                    <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-600">
                      <p className="text-sm text-slate-500 leading-relaxed font-medium italic">"{viewingComplaint.description}"</p>
                    </div>
                    {viewingComplaint.isUrgent && (
                      <div className="mt-4 flex items-center gap-2 text-rose-500 font-black text-[9px] uppercase animate-pulse">
                        <AlertCircle size={14}/> This is marked as a priority request
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Action Footer */}
              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-3">
                {viewingComplaint.status === "Scheduled" && (
                    <>
                  <button 
                    onClick={() => handleResolve(viewingComplaint._id)} 
                    className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-slate-900 transition-all"
                  >
                    Confirm Work Done & Resolve
                  </button>
                  <button 
        onClick={() => handleReraise(viewingComplaint._id)} 
        className="w-full bg-rose-50 text-rose-600 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
      >
        Work Incomplete - Request New Slot
      </button>
      </>
                )}

                <button 
                  onClick={() => setViewingComplaint(null)} 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-400 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}