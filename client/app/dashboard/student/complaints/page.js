"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";
import { Camera, Wrench, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";

export default function StudentComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State for New Complaint
  const [form, setForm] = useState({ category: "Electrical", description: "", preferredSlot: "Morning (9-12)", floor: "" });
  const [files, setFiles] = useState([]);

  useEffect(() => { fetchMyComplaints(); }, []);

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get("/complaints/my-complaints");
      setComplaints(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Your model requires: category, description, preferredSlot, floor
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("preferredSlot", form.preferredSlot);
    formData.append("floor", form.floor || Math.floor(user?.roomNumber / 100) || 1);
    
    files.forEach(file => formData.append("photos", file));

    try {
      await api.post("/complaints", formData);
      setShowForm(false);
      fetchMyComplaints();
    } catch (err) { alert("Submission failed"); }
  };

  // Step 2: Update slot after Caretaker schedules
  const confirmFinalSlot = async (id, finalSlot) => {
    try {
      await api.patch(`/complaints/${id}/slot`, { preferredSlot: finalSlot });
      fetchMyComplaints();
    } catch (err) { alert("Failed to update slot"); }
  };

  return (
    <DashboardLayout role="student" activeTab="complaints">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER & TOGGLE */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Complaints</h1>
            <p className="text-slate-500 font-medium italic">Track and manage your room maintenance</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
          >
            {showForm ? <X size={24} /> : <Plus size={24} />}
          </button>
        </div>

        {/* NEW COMPLAINT FORM */}
        {showForm && (
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-sm animate-in slide-in-from-top-4 duration-500">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Category</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    {["Electrical", "Plumbing", "Furniture", "Internet", "Cleaning", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                  <textarea 
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm mt-1 h-32 resize-none"
                    placeholder="Tell us what's broken..."
                    required
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Floor (Optional)</label>
                  <input 
                    type="number" 
                    placeholder={Math.floor(user?.roomNumber / 100) || "1"}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm mt-1"
                    onChange={e => setForm({...form, floor: e.target.value})}
                  />
                </div>
                <div className="border-2 border-dashed border-slate-100 rounded-3xl p-8 text-center cursor-pointer hover:bg-slate-50 transition" onClick={() => document.getElementById('file-up').click()}>
                  <input type="file" id="file-up" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files))} />
                  <Camera className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-[10px] font-black text-slate-400 uppercase">{files.length > 0 ? `${files.length} selected` : "Add Photos"}</p>
                </div>
                <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* COMPLAINTS FEED */}
        <div className="grid gap-6">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3 items-center">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Wrench size={20}/></div>
                  <div>
                    <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-500 uppercase">{c.category}</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">{c.description}</h3>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                  c.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {c.status}
                </div>
              </div>

              {/* ACTION: TECHNICIAN SCHEDULED */}
              {c.status === "Scheduled" && (
                <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calendar size={24} className="opacity-80" />
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-70">Technician Arrival Date</p>
                        <p className="text-xl font-bold">{new Date(c.technicianDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
                      </div>
                    </div>
                    
                    {/* Time Slot Selection after Caretaker sets date */}
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                      <p className="text-[10px] font-black uppercase mb-2">Confirm your Availability:</p>
                      <div className="flex gap-2">
                        {["2PM-4PM", "4PM-6PM"].map(slot => (
                          <button 
                            key={slot}
                            onClick={() => confirmFinalSlot(c._id, slot)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                              c.preferredSlot === slot ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white hover:bg-indigo-400'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* REJECTION VIEW */}
              {c.status === "Rejected" && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-tight">Reason: {c.rejectionReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}