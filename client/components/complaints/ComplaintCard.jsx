"use client";
import { Clock, Bell, ThumbsUp, AlertCircle, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { useState, useEffect, useMemo } from "react";

export default function ComplaintCard({ complaint, activeTab, onClick, currentUserId, onUpdate }) {
  
  // 1. Bulletproof check for "Already Voted"
const isCurrentlyUpvoted = useMemo(() => {
    if (!currentUserId || !complaint) return false;

    const curId = currentUserId.toString();
    
    // Safety check: ensure student exists before calling toString
    const creatorId = complaint.student?._id?.toString() || complaint.student?.toString();
    const isCreator = creatorId === curId;
    
    // Safety check: filter out any null/undefined from upvotes array
    const inUpvoteList = Array.isArray(complaint.upvotes) && 
                         complaint.upvotes
                           .filter(id => id != null) 
                           .some(id => id.toString() === curId);
    
    return isCreator || inUpvoteList;
  }, [complaint.upvotes, complaint.student, currentUserId]);

  const [hasUpvoted, setHasUpvoted] = useState(isCurrentlyUpvoted);
  const [votes, setVotes] = useState(complaint.upvoteCount || 0);

  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setHasUpvoted(isCurrentlyUpvoted);
    setVotes(complaint.upvoteCount || 0);
  }, [isCurrentlyUpvoted, complaint.upvoteCount]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // 1. Immediate exit if already voted or currently sending to server
    if (hasUpvoted || isProcessing) return;
    setIsProcessing(true);

    const originalVotes = votes;
    try {
      // Optimistic Update: make it look voted instantly
      setHasUpvoted(true);
      setVotes(prev => prev + 1);

      const res = await api.patch(`/complaints/${complaint._id}/upvote`);
      
      const { upvoteCount, hasUpvoted: serverHasUpvoted } = res.data;
      
      // Sync with server results
      setVotes(upvoteCount);
      setHasUpvoted(serverHasUpvoted);

      // 2. Prepare the updated upvotes array for the parent state
      let updatedUpvotes = [...(complaint.upvotes || [])];
      
      const alreadyInList = updatedUpvotes
        .filter(id => id != null)
        .some(id => id.toString() === currentUserId?.toString());

      if (!alreadyInList && currentUserId) {
        updatedUpvotes.push(currentUserId);
      }

      // Update parent list so the change persists
      onUpdate?.(complaint._id, {
        upvoteCount: upvoteCount,
        upvotes: updatedUpvotes
      });
      
    } catch (err) {
      // Revert if the server says no
      setHasUpvoted(false);
      setVotes(originalVotes);
      console.error("Upvote failed:", err);
    } finally {
      // CRITICAL: Always unlock the processing state, 
      // whether success or failure
      setIsProcessing(false);
    }
  };

  const isInactive = complaint.status === "Resolved" || complaint.status === "Rejected";

  const getStatusStyles = (status) => {
  switch (status) {
    case 'Raised': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'Get Slot': return 'bg-blue-600 text-white border-blue-600 shadow-md animate-pulse';
    case 'Scheduled': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Resolved': return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'Rejected': return 'bg-rose-50 text-rose-500 border-rose-100'; // Added Rejected style
    default: return 'bg-slate-50 text-slate-400 border-slate-100';
  }
};

  
  const needsAction = complaint.status === "Get Slot" && (!complaint.freeSlots || complaint.freeSlots.length === 0);

  return (
    <div 
      onClick={() => onClick(complaint)}
      className={`group relative bg-white rounded-2xl p-5 border transition-all cursor-pointer 
      ${isInactive ? 'opacity-60 grayscale-[0.4] border-slate-100' : 'hover:shadow-xl hover:-translate-y-1'}
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
              disabled={hasUpvoted || isProcessing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border ${
                hasUpvoted 
                ? 'bg-[#001D4C] border-[#001D4C] text-white cursor-default' 
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 active:scale-95'
              }`}
            >
              <ThumbsUp size={14} fill={hasUpvoted ? "white" : "none"} stroke={hasUpvoted ? "white" : "currentColor"} />
              <span className="text-[10px] font-black">{votes}</span>
            </button>
          ) : (
            <button className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-slate-300">
              <Bell size={16} />
            </button>
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
        <div className="flex items-center gap-1 text-[#001D4C] opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-bold uppercase tracking-widest">Details</span>
          <ChevronRight size={12} />
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