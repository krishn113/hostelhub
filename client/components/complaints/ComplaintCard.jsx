"use client";
import { Clock, Bell, ThumbsUp, AlertCircle, ChevronRight, Trash2, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { useState, useEffect, useMemo } from "react";

export default function ComplaintCard({ complaint, activeTab, onClick, currentUserId, onUpdate }) {
  
  // Logic for UI states
  const isResolved = complaint.status === "Resolved" || complaint.status === "Rejected";
  const canBeResolved = complaint.status === "Scheduled"; // Specific requirement check
  const [isProcessing, setIsProcessing] = useState(false);

  // Upvote Logic
  const isCurrentlyUpvoted = useMemo(() => {
    if (!currentUserId || !complaint) return false;
    const curId = currentUserId.toString();
    const creatorId = complaint.student?._id?.toString() || complaint.student?.toString();
    const isCreator = creatorId === curId;
    
    const inUpvoteList = Array.isArray(complaint.upvotes) && 
                         complaint.upvotes
                           .filter(id => id != null) 
                           .some(id => id.toString() === curId);
    
    return isCreator || inUpvoteList;
  }, [complaint.upvotes, complaint.student, currentUserId]);

  const [hasUpvoted, setHasUpvoted] = useState(isCurrentlyUpvoted);
  const [votes, setVotes] = useState(complaint.upvoteCount || 0);

  useEffect(() => {
    setHasUpvoted(isCurrentlyUpvoted);
    setVotes(complaint.upvoteCount || 0);
  }, [isCurrentlyUpvoted, complaint.upvoteCount]);

  // --- Handlers ---

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (hasUpvoted || isProcessing) return;
    setIsProcessing(true);
    const originalVotes = votes;
    try {
      setHasUpvoted(true);
      setVotes(prev => prev + 1);
      const res = await api.patch(`/complaints/${complaint._id}/upvote`);
      onUpdate?.(complaint._id, { 
        upvoteCount: res.data.upvoteCount, 
        upvotes: [...(complaint.upvotes || []), currentUserId] 
      });
    } catch (err) {
      setHasUpvoted(false);
      setVotes(originalVotes);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (e) => {
  e.stopPropagation();
  if (!window.confirm("Are you sure you want to delete this complaint?")) return;

  try {
    setIsProcessing(true);
    // Use backticks for the template literal
    const res = await api.delete(`/complaints/${complaint._id}`);
    
    if (res.status === 200 || res.status === 204) {
      alert("Deleted successfully");
      if (onUpdate) onUpdate();
    }
  } catch (err) {
    console.error("Delete Error details:", err.response);
    // This will tell you if it's a 401 (Auth), 404 (Path), or 500 (Server)
    alert(err.response?.data?.message || "Server rejected the delete request");
  } finally {
    setIsProcessing(false);
  }
};

 const handleResolve = async (e) => {
  if (e) e.stopPropagation();
  if (!window.confirm("Mark as resolved?")) return;

  try {
    setIsProcessing(true);
    const res = await api.patch(`/complaints/${complaint._id}/manage`, { 
      action: "Resolve" 
    });
    
    alert(res.data.message);
    if (onUpdate) onUpdate();
  } catch (err) {
    // Log this to see the "details" we added in the backend fix above
    console.log("Error Data:", err.response?.data);
    alert(err.response?.data?.details || "Update failed on server");
  } finally {
    setIsProcessing(false);
  }
};

const handleReminder = async (e) => {
  e.stopPropagation();
  if (isProcessing) return;

  try {
    setIsProcessing(true);
    const res = await api.post(`/complaints/${complaint._id}/remind`);
    
    // Success feedback
    alert(res.data.message);
  } catch (err) {
    // Handling the 429 Cooldown error or other issues
    const errorMsg = err.response?.data?.message || "Could not send reminder";
    alert(errorMsg);
  } finally {
    setIsProcessing(false);
  }
};

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Raised': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Get Slot': return 'bg-blue-600 text-white border-blue-600 shadow-md animate-pulse';
      case 'Scheduled': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Resolved': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Rejected': return 'bg-rose-50 text-rose-500 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const needsAction = complaint.status === "Get Slot" && (!complaint.freeSlots || complaint.freeSlots.length === 0);

  return (
    <div 
      onClick={() => onClick(complaint)}
      className={`group relative bg-white rounded-2xl p-5 border transition-all cursor-pointer 
      ${isResolved ? 'opacity-70 grayscale-[0.2] border-slate-100' : 'hover:shadow-xl hover:-translate-y-1'}
      ${needsAction ? 'border-blue-400 shadow-lg shadow-blue-50' : 'border-slate-100'}
    `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Today'}
          </span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${getStatusStyles(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "General" ? (
            <button 
              onClick={handleUpvote}
              disabled={hasUpvoted || isProcessing || isResolved}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border ${
                hasUpvoted 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-500 cursor-not-allowed' 
                : isResolved
                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 active:scale-95'
              }`}
            >
              <ThumbsUp size={14} fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" />
              <span className="text-[10px] font-black">{votes}</span>
            </button>
          ) : (
            <div className="flex gap-1">
               {!isResolved && (
                <button 
                  onClick={handleDelete}
                  className="p-2 rounded-lg border border-rose-100 bg-rose-50 text-rose-400 hover:bg-rose-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button 
  onClick={handleReminder}
  disabled={isProcessing}
  className={`p-2 rounded-lg border border-slate-100 bg-slate-50 transition-colors ${
    isProcessing ? 'opacity-50' : 'text-slate-400 hover:text-blue-600 hover:border-blue-200'
  }`}
  title="Send Reminder"
>
  <Bell size={14} className={isProcessing ? "animate-bounce" : ""} />
</button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {complaint.isUrgent && <AlertCircle size={14} className="text-rose-500" />}
          <h3 className="font-bold text-[#001D4C] text-sm uppercase tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
            {complaint.title}
          </h3>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">
          {complaint.category}
        </span>
        
        <div className="flex items-center gap-2">
          {/* Quick Resolve Action - Only shows on hover if status is Scheduled */}
          {canBeResolved && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
              <button 
                onClick={handleResolve}
                className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100"
              >
                <CheckCircle size={10} /> Resolve
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-[#001D4C]">
            <span className="text-[9px] font-bold uppercase tracking-widest">Details</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>

      {needsAction && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest z-10">
          Action Required
        </div>
      )}
      {complaint.status === "Rejected" && complaint.rejectionReason && (
        <p className="mt-2 text-[10px] text-rose-500 italic font-medium">
          Note: {complaint.rejectionReason}
        </p>
      )}
    </div>
  );
}