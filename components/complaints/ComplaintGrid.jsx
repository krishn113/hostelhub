"use client";
import ComplaintCard from "./ComplaintCard";

export default function ComplaintGrid({ complaints, activeTab, onCardClick, user, onUpdate }) {
  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">No complaints found in this category</p>
      </div>
    );
  }

  // Logic to pin "Action Required" (Get Slot) complaints to the top
  const sortedComplaints = [...complaints].sort((a, b) => {
    if (a.status === "Get Slot" && b.status !== "Get Slot") return -1;
    if (a.status !== "Get Slot" && b.status === "Get Slot") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedComplaints.map((item) => (
        <ComplaintCard 
          key={item._id} 
          complaint={item} 
          activeTab={activeTab}
          onClick={onCardClick}
          currentUserId={user?._id}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}