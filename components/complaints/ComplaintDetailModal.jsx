"use client";
import { useState, useEffect } from "react";
import VisualTimePicker from "./VisualTimePicker";
import { X, CheckCircle2, Circle, Calendar as CalIcon, Trash2, CheckCircle, AlertCircle, Edit3, Check, Clock, ThumbsUp } from "lucide-react";
import API from "@/lib/api";

export default function ComplaintDetailModal({ complaint, isOpen, onClose, onUpdate }) {
  const [freeSlots, setFreeSlots] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state when complaint opens or changes
  useEffect(() => {
    if (complaint) {
      const existingSlots = complaint.freeSlots || [];
      setFreeSlots(existingSlots);
      // If no slots exist yet, start in editing mode automatically
      setIsEditing(existingSlots.length === 0);
    }
  }, [complaint, isOpen]);

  if (!isOpen || !complaint) return null;

  const isGeneral = complaint.type === "General";
  const isResolved = complaint.status === "Resolved";
  const hasSubmittedSlots = complaint.freeSlots && complaint.freeSlots.length > 0;

  const steps = isGeneral 
    ? [
        { label: "Raised", key: "raisedAt" },
        { label: "Scheduled", key: "scheduledAt" },
        { label: "Resolved", key: "resolvedAt" }
      ]
    : [
        { label: "Raised", key: "raisedAt" },
        { label: "Get Slot", key: "slotsRequestedAt" },
        { label: "Scheduled", key: "scheduledAt" },
        { label: "Resolved", key: "resolvedAt" }
      ];

  const statusOrder = ["Raised", "Get Slot", "Scheduled", "Resolved"];
  const currentStepIndex = statusOrder.indexOf(complaint.status);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const finalSlots = isGeneral 
      ? [{ startTime: "09:00", endTime: "18:00" }] 
      : freeSlots;

      const res = await API.patch(`/complaints/${complaint._id}/submit-slots`, {
        freeSlots: finalSlots
      });

      if (onUpdate) {
        onUpdate(complaint._id, res.data.complaint);
      }
      
      alert("Availability shared successfully!");
      setIsEditing(false); 

      if (onClose) {
      onClose();
    }
      
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to save slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimelineDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

const handleNotAvailable = async () => {
    // FIX: Use complaint._id instead of the undefined 'id'
    const complaintId = complaint?._id;

    console.log("Attempting reschedule for ID:", complaintId); 
    
    if (!complaintId) {
      alert("Error: Complaint ID is missing");
      return;
    }

    if (!window.confirm("Mark yourself as unavailable for this date? This will ask the caretaker to reschedule.")) return;
    
    try {
      setLoading(true);
      // Ensure the URL matches your backend route
      const res = await API.patch(`/complaints/${complaintId}/reschedule`);
      
      console.log("Response:", res.data);
      
      alert("Reschedule requested successfully!");
      
      if (onUpdate) onUpdate(); 
      if (onClose) onClose();
      
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      alert(`Failed: ${err.response?.data?.message || "Server Error"}`);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await API.delete(`/complaints/${complaint._id}`);
      alert("Complaint deleted.");
      if (onUpdate) onUpdate(); // Refresh the list
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm("Is your issue fixed? Marking as resolved will close this complaint.")) return;
    try {
      setLoading(true);
      // Reusing your existing quickResolve endpoint
      await API.patch(`/complaints/${complaint._id}/resolve`, { isResolved: true });
      alert("Status updated to Resolved!");
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      alert("Failed to resolve complaint");
    } finally {
      setLoading(false);
    }
  };

  const formatProposedDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#001D4C]/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {!isResolved && (
              <button 
                onClick={handleDelete}
                className="p-2 mr-2 text-rose-400 hover:bg-rose-50 rounded-full transition-colors group"
                title="Delete Complaint"
              >
                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
            <span className="text-[10px] font-black text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full uppercase tracking-widest">
              {complaint.category}
            </span>
            {isGeneral && (
              <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                <ThumbsUp size={10} /> {complaint.upvoteCount || 0} Upvotes
              </span>
            )}
            {complaint.isUrgent && (
              <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                <AlertCircle size={12} /> Urgent
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          {/* Title & Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#001D4C] uppercase tracking-tight">
              {complaint.title}
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed border-l-4 border-slate-100 pl-4 italic">
              {complaint.description}
            </p>

            {/* SCHEDULED INFO BANNER (Visible only if Scheduled) */}
            {complaint.status === "Scheduled" && (
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-2">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest opacity-60">Technician Visit Scheduled</p>
                  <p className="text-sm font-bold text-blue-700">
                    {formatProposedDate(complaint.proposedDate)} <span className="mx-1 text-blue-300">@</span> {complaint.scheduledVisit?.start} — {complaint.scheduledVisit?.end}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Section */}
          <div className="mb-14 relative px-2">
            <div className="flex justify-between relative z-10">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const dateVal = complaint.timeline?.[step.key];
                
                return (
                  <div key={step.label} className="flex flex-col items-center gap-2 w-20">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                      isCompleted ? "bg-[#001D4C] border-blue-100 text-white" : "bg-white border-slate-100 text-slate-200"
                    }`}>
                      {idx < currentStepIndex ? <CheckCircle2 size={14} /> : <Circle size={8} fill="currentColor" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-[9px] font-black uppercase tracking-tighter ${isCompleted ? "text-[#001D4C]" : "text-slate-300"}`}>
                        {step.label}
                      </p>
                      {dateVal && (
                        <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5 leading-none">
                          {formatTimelineDate(dateVal)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-100 -z-0" />
          </div>

          {/* Slot Picker / View Section */}
          {complaint.status === "Get Slot" && (
            <div className="space-y-6">
              {!isEditing && hasSubmittedSlots ? (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[#001D4C] font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Check size={14} className="text-emerald-500" /> Shared Availability
                    </h4>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase hover:underline"
                    >
                      <Edit3 size={12} /> Edit Slots
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {freeSlots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-100 text-[11px] font-bold text-[#001D4C]">
                        <Clock size={12} className="text-slate-400" />
                        <span>{slot.startTime}</span>
                        <span className="text-slate-300">—</span>
                        <span>{slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#001D4C] rounded-3xl p-8 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Select Availability</h4>
                      <p className="text-[10px] text-blue-300 uppercase tracking-widest">
                        Proposed Date: {complaint.proposedDate ? new Date(complaint.proposedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'TBA'}
                      </p>
                    </div>
                    {hasSubmittedSlots && (
                       <button 
                         onClick={() => setIsEditing(false)} 
                         className="text-[10px] font-bold text-blue-300 underline uppercase tracking-tight"
                       >
                         Cancel
                       </button>
                    )}
                  </div>
                  <VisualTimePicker freeSlots={freeSlots} setFreeSlots={setFreeSlots} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          {!isResolved && (
            <button 
              onClick={handleResolve}
              disabled={loading}
              className="w-full py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all active:scale-[0.98]"
            >
              <CheckCircle size={14} /> Mark as Resolved & Close
            </button>
          )}

        {(complaint.status === "Get Slot" && (isEditing || !hasSubmittedSlots)) && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {freeSlots.length} Ranges Selected
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleNotAvailable}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl border border-rose-200 text-rose-500 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all disabled:opacity-50"
              >
                Not Available
              </button>

              <button 
                onClick={handleConfirm}
                disabled={freeSlots.length === 0 || loading}
                className="flex-[2] py-4 bg-[#001D4C] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-20 transition-all shadow-lg active:scale-95"
              >
                {loading ? "Syncing..." : hasSubmittedSlots ? "Update Availability" : "Confirm Availability"}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}