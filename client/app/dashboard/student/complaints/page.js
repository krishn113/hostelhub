"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { 
  Wrench, History, Plus, X, Search, Filter, RotateCcw,
  CheckCircle2, Clock, Ban, Calendar as CalendarIcon,
  ChevronDown, ChevronUp
} from "lucide-react";
import CalendarModal from "@/components/CalendarModal";

const STATUS_STEPS = ["Pending", "Accepted", "Scheduled", "In Progress", "Resolved"];
const CATEGORIES = ["All", "Electrical", "Plumbing", "Furniture", "Internet", "Cleaning", "Other"];

export default function StudentComplaints() {
  const { user } = useAuth();
  const [filterDate, setFilterDate] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [expandedTimeline, setExpandedTimeline] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [form, setForm] = useState({ title: "", category: "Electrical", description: "", floor: "" });

  useEffect(() => { fetchMyComplaints(); }, []);

  const fetchMyComplaints = async () => {
    try {
      const res = await API.get("/complaints/my-complaints");
      setComplaints(res.data);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const toggleTimeline = (id) => {
    setExpandedTimeline(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setFilterDate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/complaints", { ...form, floor: form.floor || "1" });
      setShowForm(false);
      setForm({ title: "", category: "Electrical", description: "", floor: "" });
      fetchMyComplaints();
    } catch (err) { alert(err.response?.data?.msg || "Submission failed"); }
  };

  const getTimelineProgress = (currentStatus) => {
    if (currentStatus === "Rejected") return "100%";
    const index = STATUS_STEPS.indexOf(currentStatus);
    return index === -1 ? "0%" : `${(index / (STATUS_STEPS.length - 1)) * 100}%`;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-400 text-white';
      case 'Accepted': return 'bg-blue-400 text-white';
      case 'Scheduled': return 'bg-indigo-500 text-white';
      case 'In Progress': return 'bg-purple-500 text-white';
      case 'Resolved': return 'bg-emerald-500 text-white';
      case 'Rejected': return 'bg-rose-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesDate = filterDate ? new Date(c.createdAt).toDateString() === filterDate.toDateString() : true;
    return matchesSearch && matchesCategory && matchesDate;
  });

  const isFilterActive = searchQuery !== "" || selectedCategory !== "All" || filterDate !== null;

  return (
    <DashboardLayout role="student" activeTab="complaints">
      <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Complaints</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Track and file room issues</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCalendar(!showCalendar)} className="bg-white border border-slate-200 text-slate-500 p-2 rounded-xl shadow-sm">
              <CalendarIcon size={18} />
            </button>
            <button onClick={() => setShowForm(!showForm)} className={`${showForm ? 'bg-rose-500' : 'bg-indigo-600'} text-white px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2`}>
              {showForm ? <X size={16} /> : <><Plus size={16} /><span className="font-bold text-[10px] uppercase tracking-widest">New Request</span></>}
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" placeholder="Search by title..." 
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-white border border-slate-100 rounded-xl py-2.5 px-4 text-[10px] font-black uppercase tracking-wider focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
              value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {isFilterActive && (
              <button onClick={clearFilters} className="bg-slate-100 text-slate-500 p-2.5 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
                <RotateCcw size={14} />
                <span className="text-[9px] font-black uppercase">Clear</span>
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Heading</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Broken Fan" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Category</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Detailed Description</label>
                  <textarea className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 h-[140px] resize-none focus:ring-2 focus:ring-indigo-500" placeholder="Details..." required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all">Submit Request</button>
            </form>
          </div>
        )}

        {/* Complaints List */}
        <div className="grid gap-4">
          {filteredComplaints.map((c) => {
            const isExpanded = expandedTimeline[c._id];
            return (
<div key={c._id} className={`bg-white p-6 rounded-[2rem] border border-slate-100 border-l-8 shadow-sm relative overflow-hidden group ${
  c.status === 'Pending' ? 'border-l-amber-400' : 
  c.status === 'Accepted' ? 'border-l-blue-400' : 
  c.status === 'Scheduled' ? 'border-l-indigo-500' : 
  c.status === 'In Progress' ? 'border-l-purple-500' : 
  c.status === 'Resolved' ? 'border-l-emerald-500' : 
  c.status === 'Rejected' ? 'border-l-rose-500' : 'border-l-slate-400'
}`}>
                  <div className={`absolute top-5 right-6 px-3.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${getStatusStyles(c.status)}`}>
                  {c.status}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* LEFT SIDE: Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl h-fit"><Wrench size={20}/></div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black bg-indigo-50 px-2 py-0.5 rounded-full text-indigo-500 uppercase tracking-widest">{c.category}</span>
                          <span className="text-[8px] text-slate-300 font-bold tracking-widest uppercase italic">Floor {c.floor}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">{c.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed text-xs pl-3 border-l-2 border-slate-100">
                      {c.description}
                    </p>
                  </div>
<div className="flex items-center">
  <button 
    onClick={() => toggleTimeline(c._id)} 
    className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 px-4 py-2 rounded-xl transition-all border border-slate-100 h-fit"
  >
    <span className="text-[9px] font-black uppercase tracking-widest">{isExpanded ? "Hide Progress" : "View Progress"}</span>
    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
  </button>
</div>
                  {/* RIGHT SIDE: Timeline (Only when expanded) */}
                  {isExpanded && (
                    <div className="lg:w-72 bg-slate-50/40 p-5 rounded-[1.5rem] border border-slate-100 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-1.5 mb-5">
                        <History size={12} className="text-indigo-500" />
                        <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Progress Log</h4>
                      </div>
                      
                      <div className="relative flex-1">
                        <div className="absolute left-[9px] top-1.5 bottom-1.5 w-[1.5px] bg-slate-200" />
                        <div className="absolute left-[9px] top-1.5 w-[1.5px] bg-indigo-500 transition-all duration-700" 
                             style={{ height: getTimelineProgress(c.status) }} />

                        <div className="space-y-6 relative">
                          {c.updates?.map((update, index) => {
                            const isCurrentActive = update.status === c.status;
                            return (
                              <div key={index} className="relative pl-7">
                                <div className={`absolute left-0 mt-0.5 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-all ${isCurrentActive ? 'bg-indigo-600 scale-110' : 'bg-slate-200'}`}>
                                  {update.status === 'Resolved' ? <CheckCircle2 size={8} className="text-white" /> : 
                                   update.status === 'Rejected' ? <Ban size={8} className="text-white" /> :
                                   <Clock size={8} className={isCurrentActive ? "text-white animate-spin-slow" : "text-slate-400"} />}
                                </div>
                                <div className="space-y-0.5">
                                  <p className={`font-black text-[9px] uppercase tracking-tighter ${isCurrentActive ? 'text-indigo-600' : 'text-slate-400'}`}>{update.status}</p>
                                  <p className={`text-[10px] font-bold leading-tight ${isCurrentActive ? 'text-slate-700' : 'text-slate-500'}`}>{update.message}</p>
                                  <p className="text-[8px] text-slate-300 font-bold tabular-nums">
                                    {new Date(update.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
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
            );
          })}
        </div>
      </div>
      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} complaints={complaints} onSelectDate={(date) => setFilterDate(date)} />
    </DashboardLayout>
  );
}