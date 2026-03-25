"use client";
import { X, User, MapPin, History, CheckCircle2, Clock, Mail, Phone, Hash, graduationCap, GraduationCap } from "lucide-react";

export default function StudentHistoryModal({ isOpen, onClose, studentData }) {
  if (!isOpen || !studentData) return null;

  // Calculate stats
  const totalComplaints = studentData.history?.length || 0;
  const resolvedComplaints = studentData.history?.filter(h => h.status === 'Resolved').length || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#001D4C]/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* 1. HEADER SECTION: Personal Details */}
        <div className="bg-slate-50 p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center text-[#001D4C] border border-slate-100 relative">
                <User size={40} />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg border-4 border-slate-50">
                  <CheckCircle2 size={12} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#001D4C] uppercase tracking-tighter leading-none mb-2">
                  {studentData.name}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">
                    <Hash size={10} className="text-blue-500" /> {studentData.entryNo || "2023CSB1001"}
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">
                    <MapPin size={10} className="text-rose-500" /> Room {studentData.roomNo} ({studentData.floor || "2nd"} Floor)
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Contact & Academic Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail size={14} className="text-blue-500" />
                <span className="text-[11px] font-medium truncate">{studentData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone size={14} className="text-emerald-500" />
                <span className="text-[11px] font-medium">{studentData.phone || "+91 98765 43210"}</span>
              </div>
            </div>
            <div className="space-y-2 border-l border-slate-200 pl-4">
              <div className="flex items-center gap-2 text-slate-500">
                <GraduationCap size={14} className="text-indigo-500" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{studentData.degree || "B.Tech CSE"}</span>
              </div>
              <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                Year: {studentData.year || "3rd Year"}
              </div>
            </div>
          </div>
        </div>

        {/* 2. HISTORY SECTION */}
        <div className="flex-1 overflow-y-auto p-8 pt-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-[#001D4C] p-1.5 rounded-lg">
                <History size={14} className="text-white" />
              </div>
              <h3 className="text-[11px] font-black text-[#001D4C] uppercase tracking-[0.2em]">
                Complaint Activity
              </h3>
            </div>
            
            {/* Complaint Counter Badge */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <span className="text-[10px] font-black text-[#001D4C]">{totalComplaints}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Logs</span>
            </div>
          </div>

          <div className="space-y-3">
            {studentData.history && studentData.history.length > 0 ? (
              studentData.history.map((entry, idx) => (
                <div 
                  key={idx} 
                  className="group flex flex-col p-4 rounded-[1.5rem] border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-black text-[#001D4C] uppercase tracking-tight">
                        {entry.title}
                      </p>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded">
                        {entry.category}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                      entry.status === 'Resolved' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {entry.status === 'Resolved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {entry.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Raised</span>
                        <span className="text-[9px] font-bold text-slate-500">
                          {new Date(entry.createdAt || entry.date).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      {entry.status === 'Resolved' && (
                        <div className="flex flex-col border-l border-slate-100 pl-3">
                          <span className="text-[7px] font-black text-emerald-300 uppercase tracking-widest">Resolved</span>
                          <span className="text-[9px] font-bold text-emerald-600">
                            {entry.timeline?.resolvedAt ? new Date(entry.timeline.resolvedAt).toLocaleDateString('en-GB') : "Recently"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History size={20} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">No past complaints found</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. FOOTER */}
        <div className="p-6 bg-white border-t border-slate-50 flex justify-center">
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hover:text-[#001D4C] transition-all"
          >
            Close Profile <X size={12} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}