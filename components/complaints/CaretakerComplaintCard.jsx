"use client";
import { User, Clock, Tag, AlertCircle, ThumbsUp, CheckCircle2, Send, X, XCircle, BellRing } from "lucide-react";
import api from "@/lib/api";
import { useState } from "react";

export default function CaretakerComplaintCard({ 
  complaint, 
  isSelected, 
  onSelect, 
  onStudentClick, 
  onUpdate,
  isWarden
}) {
  const [isResolving, setIsResolving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  const isResolved = complaint.status === "Resolved";
  const isRejected = complaint.status === "Rejected";
  const isInactive = isResolved || isRejected;

  // Reminder Logic: Highlight if a reminder was sent in the last 24 hours
const lastReminded = complaint.timeline?.lastRemindedAt || complaint.lastReminderAt;
const isReminded = lastReminded && !isInactive;

  // Helper to show relative time for reminder
  const getRelativeReminderTime = (date) => {
    if (!date) return "";
    const diff = new Date() - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    return `${hours}h ago`;
  };

  const handleAction = async (actionType) => {
    if (isInactive) return;
    try {
      if (actionType === 'resolve') {
        setIsResolving(true);
        await api.patch(`/complaints/${complaint._id}/quick-resolve`);
      } else {
        if (!rejectReason.trim()) return alert("Please provide a reason");
        await api.patch(`/complaints/${complaint._id}/reject`, { reason: rejectReason });
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(`${actionType} failed:`, err);
    } finally {
      setIsResolving(false);
      setIsRejecting(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Raised': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Get Slot': return 'bg-blue-600 text-white border-blue-600 shadow-md animate-pulse';
      case 'Scheduled': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Resolved': return 'bg-slate-100 text-slate-400 border-slate-200';
      case 'Rejected': return 'bg-rose-50 text-rose-400 border-rose-100 opacity-80';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div 
      className={`group relative bg-white rounded-2xl p-5 border transition-all flex flex-col h-full ${
        isResolved 
          ? 'opacity-60 grayscale-[0.3] border-slate-100 cursor-default' 
          : 'hover:shadow-xl hover:-translate-y-1 border-slate-100 cursor-pointer'
      } ${
        isSelected && !isResolved ? 'border-blue-500 ring-1 ring-blue-500' : ''
      } ${
        isReminded ? 'border-blue-400 shadow-lg shadow-blue-100 ring-1 ring-blue-100 bg-blue-50/10' : ''
      }`}
    >
      {/* 1. COMPACT HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          {!isResolved && !isWarden && (
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => onSelect(complaint._id)}
              className="w-4 h-4 rounded border-slate-300 text-[#001D4C] focus:ring-[#001D4C] cursor-pointer" 
            />
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStudentClick(complaint.student?._id || complaint.studentId);
            }}
            disabled={isResolved}
            className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${!isResolved && 'hover:bg-slate-50'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${isResolved ? 'bg-slate-300' : 'bg-[#001D4C]'}`}>
              <User size={14} />
            </div>
            <div className="text-left">
              <p className={`text-[10px] font-black uppercase tracking-wide leading-none ${isResolved ? 'text-slate-400' : 'text-[#001D4C]'}`}>
                {complaint.student?.name || complaint.studentName || "Student"}
              </p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                {isResolved ? 'Complaint Closed' : 'Click to view profile'}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
           {complaint.type === "General" ? (
             <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-400">
               <ThumbsUp size={12} />
               <span className="text-[10px] font-bold">{complaint.upvoteCount || 0}</span>
             </div>
           ) : (
             <div className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-tighter ${isResolved ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
               Room {complaint.student?.roomNo || complaint.roomNo}
             </div>
           )}
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="flex-grow mb-4">
        <div className="flex items-center gap-2 mb-1">
          {complaint.isUrgent && !isResolved && <AlertCircle size={14} className="text-rose-500" />}
          <h3 className={`font-bold text-sm uppercase tracking-tight line-clamp-1 ${isResolved ? 'text-slate-400' : 'text-[#001D4C]'}`}>
            {complaint.title}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic">
          {complaint.description}
        </p>
      </div>

      {/* 3. UTILITY ROW */}
      <div className="flex items-center justify-between mb-4">
        {/* Reminder Badge (Goal 4 Integration) */}
        {isReminded ? (
          <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2 py-1 rounded-md shadow-sm animate-pulse">
            <BellRing size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Reminder: {getRelativeReminderTime(lastReminded)}
            </span>
          </div>
        ) : <div />}

        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${getStatusStyles(complaint.status)}`}>
          {complaint.status}
        </span>
      </div>

      {/* 4. REFINED FOOTER */}
      <div className="pt-3 border-t border-slate-50">
        {isRejecting ? (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <input 
              autoFocus
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-1.5 text-[10px] focus:ring-1 focus:ring-rose-500 outline-none"
            />
            <button onClick={() => handleAction('reject')} className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg">
              <Send size={14} />
            </button>
            <button onClick={() => { setIsRejecting(false); setRejectReason(""); }} className="text-slate-400 p-1.5 hover:bg-slate-50 rounded-lg">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Tag size={10} className="text-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded">{complaint.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  {new Date(complaint.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>

            {!isInactive && !isWarden && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsRejecting(true); }}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Reject Complaint"
                >
                  <XCircle size={18} />
                </button>

                {complaint.type === "General" && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAction('resolve'); }}
                    disabled={isResolving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 size={12} />
                    {isResolving ? "..." : "Resolve"}
                  </button>
                )}
              </div>
            )}
            
            {isRejected && complaint.rejectionReason && (
              <p className="text-[9px] text-rose-400 italic font-medium truncate max-w-[150px]">
                Reason: {complaint.rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Floating Badges */}
      <div className="absolute -top-2 -right-2 flex flex-col gap-1 items-end">
        {complaint.isUrgent && !isResolved && (
          <div className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest z-10">
            Urgent
          </div>
        )}
        {isReminded && (
           <div className="bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest z-10 border border-blue-400">
            Reminded
          </div>
        )}
      </div>
    </div>
  );
}