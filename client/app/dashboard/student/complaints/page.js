"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { 
  Wrench, History, Plus, X, Clock, Calendar,
  CheckCircle2, ChevronDown, ChevronUp, AlertCircle,
  MapPin, Tag
} from "lucide-react";

const STATUS_STEPS = ["Raised", "Get Slot", "Scheduled", "Resolved"];
const CATEGORIES = ["Electrical", "Plumbing", "Furniture", "Internet", "Cleaning", "Other"];
const WORKING_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

export default function StudentComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedTimeline, setExpandedTimeline] = useState({});
  
  // Slot Picker State
  const [pickingSlotsFor, setPickingSlotsFor] = useState(null);
  const [tempSlots, setTempSlots] = useState([]);

  // Form State
  const [form, setForm] = useState({ 
    title: "", 
    category: "Electrical", 
    description: "", 
    isUrgent: false 
  });

  useEffect(() => { fetchMyComplaints(); }, []);

  const fetchMyComplaints = async () => {
    try {
      const res = await API.get("/complaints/my-complaints");
      setComplaints(res.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  };

  const toggleTimeline = (id) => {
    setExpandedTimeline(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/complaints", form);
      setShowForm(false);
      setForm({ title: "", category: "Electrical", description: "", isUrgent: false });
      fetchMyComplaints();
    } catch (err) { 
      alert(err.response?.data?.msg || "Submission failed"); 
    }
  };

  const handleSlotSubmit = async () => {
    if (tempSlots.length === 0) return alert("Please select at least one slot");
    try {
      // FIXED: Endpoint now matches the unified controller logic
      await API.patch(`/complaints/${pickingSlotsFor._id}/submit-slots`, { slots: tempSlots });
      setPickingSlotsFor(null);
      setTempSlots([]);
      fetchMyComplaints();
      alert("Availability updated! Caretaker will now finalize the time.");
    } catch (err) {
      console.error("Slot Update Error:", err);
      alert("Failed to save slots.");
    }
  };

  // --- NEW: REMINDER LOGIC ---
  const canSendReminder = (createdAt) => {
    const fortyEightHours = 48 * 60 * 60 * 1000;
    return Date.now() - new Date(createdAt).getTime() > fortyEightHours;
  };

  const handleSendReminder = async (id) => {
    try {
      await API.patch(`/complaints/${id}/reminder`);
      alert("Reminder sent to caretaker! Your complaint is now highlighted.");
      fetchMyComplaints(); // Refresh to show updated state if needed
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to send reminder");
    }
  };

  const toggleSlot = (hour) => {
    setTempSlots(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const formatHour = (h) => {
    if (h === undefined || h === null) return "TBD";
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:00 ${suffix}`;
  };

  const getTimelineProgress = (status) => {
    if (status === "Rejected") return "100%";
    const index = STATUS_STEPS.indexOf(status);
    return index === -1 ? "0%" : `${(index / (STATUS_STEPS.length - 1)) * 100}%`;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Raised': return 'bg-amber-400 text-white';
      case 'Get Slot': return 'bg-blue-500 text-white shadow-lg shadow-blue-100 animate-pulse';
      case 'Scheduled': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-100';
      case 'Resolved': return 'bg-emerald-500 text-white';
      case 'Rejected': return 'bg-rose-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <DashboardLayout role="student" activeTab="complaints">
      <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 md:pt-8">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">My Requests</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Dormitory Maintenance Portal</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={`${showForm ? 'bg-rose-500' : 'bg-slate-900'} text-white px-6 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-3 hover:scale-105 active:scale-95`}
          >
            {showForm ? <X size={18} /> : <><Plus size={18} /><span className="font-black text-[10px] uppercase tracking-widest">File Complaint</span></>}
          </button>
        </div>

        {/* COMPLAINT FORM */}
        {showForm && (
          <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Issue Heading</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm mt-2 focus:ring-2 focus:ring-slate-900 transition-all" placeholder="e.g. Water Seepage in Room" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Category</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {CATEGORIES.map(c => (
                        <button key={c} type="button" onClick={() => setForm({...form, category: c})} className={`py-3 rounded-xl text-[10px] font-bold uppercase border-2 transition-all ${form.category === c ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-rose-50 rounded-2xl border-2 border-rose-100 cursor-pointer" onClick={() => setForm({...form, isUrgent: !form.isUrgent})}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isUrgent ? 'bg-rose-500 border-rose-500' : 'bg-white border-rose-200'}`}>
                      {form.isUrgent && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest">High Priority</p>
                      <p className="text-[9px] font-bold text-rose-400 uppercase italic">Requires immediate technician attention</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Description</label>
                  <textarea className="w-full bg-slate-50 border-none rounded-3xl py-5 px-6 text-sm mt-2 h-[280px] resize-none focus:ring-2 focus:ring-slate-900" placeholder="Please describe the issue in detail..." required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all">Submit Maintenance Request</button>
            </form>
          </div>
        )}

        {/* COMPLAINTS LIST */}
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${getStatusStyles(c.status)}`}>
                        {c.status}
                      </span>
                      {c.isUrgent && <span className="flex items-center gap-1 bg-rose-500 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase animate-pulse"><AlertCircle size={10}/> Priority</span>}
                  
  {c.status !== "Resolved" && c.status !== "Rejected" && !c.isReminderSent && canSendReminder(c.createdAt) && (
    <button 
      onClick={() => handleSendReminder(c._id)}
      className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[8px] font-black uppercase hover:bg-amber-200 transition-all border border-amber-200"
    >
      <Clock size={10}/> Send Reminder
    </button>
  )}

  {c.isReminderSent && (
    <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-[8px] font-black uppercase border border-indigo-200">
      <AlertCircle size={10}/> Reminder Sent
    </span>
  )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{c.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Ref ID: {c._id.slice(-8)} • Room {user?.roomNumber}</p>
                    </div>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl italic border-l-4 border-slate-200">
                      "{c.description}"
                    </p>

                    {/* PHASE 2: SLOT SELECTION UI */}
                    {c.status === "Get Slot" && (
                      <div className="mt-6 p-6 bg-blue-600 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-100 animate-in zoom-in duration-300">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 rounded-2xl text-white"><Clock size={24}/></div>
                          <div>
                            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Technician Ready</p>
                            <p className="text-sm font-black text-white italic">Suggested Date: {new Date(c.proposedDate).toDateString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setPickingSlotsFor(c); setTempSlots(c.freeSlots || []); }}
                          className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                        >
                          Select Your Availability
                        </button>
                      </div>
                    )}

                    {/* PHASE 3: CONFIRMED APPOINTMENT UI */}
                    {c.status === "Scheduled" && (
                      <div className="mt-6 p-6 bg-slate-900 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl border-t-4 border-emerald-500">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg">
                            <CheckCircle2 size={24}/>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visit Confirmed</p>
                            <p className="text-sm font-black text-white uppercase italic">
                              Caretaker arriving at {formatHour(c.scheduledTime)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white/10 px-6 py-3 rounded-2xl text-center">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                           <p className="text-xs font-bold text-white uppercase">
                             {new Date(c.proposedDate).toLocaleDateString()}
                           </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center border-l border-slate-50 pl-8">
                     <button onClick={() => toggleTimeline(c._id)} className="flex flex-col items-center gap-2 group/btn">
                        <div className={`p-4 rounded-full transition-all ${expandedTimeline[c._id] ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 group-hover/btn:bg-slate-100'}`}>
                          {expandedTimeline[c._id] ? <ChevronUp size={20}/> : <History size={20}/>}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Timeline</span>
                     </button>
                  </div>
                </div>

                {expandedTimeline[c._id] && (
                  <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col lg:flex-row gap-10 animate-in fade-in duration-500">
                    <div className="flex-1 space-y-6">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><History size={14}/> Resolution Log</h4>
                       <div className="relative pl-6 space-y-8">
                          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100" />
                          <div className="absolute left-[7px] top-2 w-0.5 bg-indigo-500 transition-all duration-1000" style={{ height: getTimelineProgress(c.status) }} />
                          {STATUS_STEPS.map((step, idx) => {
                            const isPast = STATUS_STEPS.indexOf(c.status) >= idx;
                            const isCurrent = c.status === step;
                            return (
                              <div key={idx} className="relative flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${isPast ? 'bg-indigo-500 scale-110' : 'bg-slate-200'}`} />
                                <div>
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>{step}</p>
                                  {isCurrent && <p className="text-[9px] font-bold text-slate-500 lowercase italic">Current Stage</p>}
                                </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SLOT SELECTION MODAL */}
        {pickingSlotsFor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-[200] p-6">
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-blue-600 p-10 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(pickingSlotsFor.proposedDate).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-3xl font-black uppercase italic leading-none">Pick Your Slot</h2>
                </div>
                <button onClick={() => setPickingSlotsFor(null)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><X /></button>
              </div>
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  {WORKING_HOURS.map((hour) => {
                    const active = tempSlots.includes(hour);
                    return (
                      <button key={hour} onClick={() => toggleSlot(hour)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${active ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>
                        {formatHour(hour)} - {formatHour(hour + 1)}
                      </button>
                    );
                  })}
                </div>
                <button onClick={handleSlotSubmit} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all">Update Availability</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}