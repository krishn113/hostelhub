"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";
import { 
  Wrench, History, Eye, Plus, X, 
  Calendar as CalendarIcon, CheckCircle2, Clock, Ban 
} from "lucide-react";
import CalendarModal from "@/components/CalendarModal";

export default function StudentComplaints() {
  const { user } = useAuth();
  const [filterDate, setFilterDate] = useState(null); // <--- NEW: State for selected date
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [form, setForm] = useState({ 
    title: "", 
    category: "Electrical", 
    description: "", 
    floor: "" 
  });

  useEffect(() => { 
    fetchMyComplaints(); 
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get("/complaints/my-complaints");
      setComplaints(res.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const complaintData = {
      title: form.title,
      category: form.category,
      description: form.description,
      floor: form.floor || "1"
    };

    try {
      await api.post("/complaints", complaintData);
      setShowForm(false);
      setForm({ title: "", category: "Electrical", description: "", floor: "" });
      fetchMyComplaints();
    } catch (err) { 
      alert(err.response?.data?.msg || "Submission failed"); 
    }
  };

  // <--- NEW: Logic to filter the list based on the calendar click
  const displayedComplaints = filterDate 
    ? complaints.filter(c => new Date(c.createdAt).toDateString() === filterDate.toDateString())
    : complaints;

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-500 text-white';
      case 'Rejected': return 'bg-rose-500 text-white';
      case 'Scheduled':
      case 'In Progress': return 'bg-amber-400 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <DashboardLayout role="student" activeTab="complaints">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Complaints</h1>
            <p className="text-slate-500 font-medium mt-2">Track and file room issues</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="bg-white border-2 border-slate-100 text-slate-600 p-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-all"
            >
              <CalendarIcon size={24} />
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className={`${showForm ? 'bg-rose-500' : 'bg-indigo-600'} text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center gap-2`}
            >
              {showForm ? <X size={24} /> : <><Plus size={24} /><span className="font-bold pr-2">New Request</span></>}
            </button>
          </div>
        </div>

        {/* FORM SECTION */}
        {showForm && (
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Complaint Heading</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Water leakage in bathroom"
                      required
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Category</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 appearance-none"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      {["Electrical", "Plumbing", "Furniture", "Internet", "Cleaning", "Other"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Detailed Description</label>
                  <textarea 
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 h-[140px] resize-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Provide details to help the technician..."
                    required
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Submit Maintenance Request
              </button>
            </form>
          </div>
        )}

        {/* FEED: RENDERING COMPLAINTS */}
        <div className="grid gap-8">
          {/* <--- UPDATED: Changed from complaints.length to displayedComplaints.length */}
          {displayedComplaints.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                {filterDate ? "No complaints on this date." : "No complaints filed yet."}
              </p>
            </div>
          ) : (
            /* <--- UPDATED: mapping through displayedComplaints now */
            displayedComplaints.map((c) => (
              <div key={c._id} className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                
                <div className={`absolute top-8 right-8 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusStyles(c.status)}`}>
                  {c.status}
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-1 space-y-6">
                    <div className="flex gap-5">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl h-fit"><Wrench size={28}/></div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black bg-indigo-50 px-3 py-1 rounded-full text-indigo-500 uppercase tracking-widest">{c.category}</span>
                           <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Room Floor: {c.floor}</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{c.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 font-medium leading-relaxed text-lg pl-2 border-l-4 border-slate-100">
                      {c.description}
                    </p>

                    {c.attachments?.length > 0 && (
                      <div className="flex gap-3 pt-4">
                        {c.attachments.map((url, i) => (
                          <button key={i} onClick={() => window.open(url, '_blank')} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-100 hover:border-indigo-300 transition-all">
                            <img src={url} className="w-full h-full object-cover" alt="attachment" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:w-80 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                    <div className="flex items-center gap-2 mb-8">
                      <History size={16} className="text-indigo-500" />
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Live Updates</h4>
                    </div>
                    
                    <div className="space-y-8 relative">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />

                      {c.updates?.map((update, index) => (
                        <div key={index} className="relative pl-10">
                          <div className={`absolute left-0 mt-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                            ${index === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                            {update.status === 'Resolved' ? <CheckCircle2 size={10} className="text-white" /> : 
                             update.status === 'Rejected' ? <Ban size={10} className="text-white" /> :
                             <Clock size={10} className="text-white" />}
                          </div>
                          
                          <div className="space-y-1">
                            <p className="font-black text-xs text-slate-800 uppercase tracking-tighter">{update.status}</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">{update.message}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase pt-1">
                              {new Date(update.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* <--- NEW: Calendar Modal and Filter Button at bottom */}
      <CalendarModal 
        isOpen={showCalendar} 
        onClose={() => setShowCalendar(false)} 
        complaints={complaints}
        onSelectDate={(date) => setFilterDate(date)}
      />

      {filterDate && (
        <button 
          onClick={() => setFilterDate(null)}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 z-50 animate-bounce"
        >
          <X size={16} /> Clear Date Filter: {filterDate.toLocaleDateString()}
        </button>
      )}
    </DashboardLayout>
  );
}