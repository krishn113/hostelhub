"use client";
import React, { useState } from "react";
import { Check, X, Unlock, AlertCircle, Hash, User } from "lucide-react";
import API from "@/lib/api";

const DAY_START_MIN = 9 * 60; // 9:00 AM
const DAY_END_MIN = 18 * 60;  // 6:00 PM
const TOTAL_MINS = DAY_END_MIN - DAY_START_MIN;
const SLOT_DURATION = 30; // 30 mins

export default function CaretakerScheduleTable({ complaints, onUpdate, selectedDate, onStudentClick }) {
  const [hoverData, setHoverData] = useState({ id: null, startMin: 0, xPercent: 0, isValid: false });

  const timeToMin = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const minToTime = (totalMin) => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const checkIfValid = (startMin, freeSlots) => {
    if (!freeSlots || freeSlots.length === 0) return false;
    const endMin = startMin + SLOT_DURATION;
    
    return freeSlots.some(slot => {
      const slotStart = timeToMin(slot.startTime);
      const slotEnd = timeToMin(slot.endTime);
      return startMin >= slotStart && endMin <= slotEnd;
    });
  };

  const normalizeDate = (dateInput) => {
    if (!dateInput) return null;
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    } catch (e) {
      return null;
    }
  };

  const dailyComplaints = (complaints || []).filter(c => {
    if (!c.proposedDate) return false;
    const dbDate = normalizeDate(c.proposedDate);
    const uiDate = normalizeDate(selectedDate);
    if (!dbDate || !uiDate) return false;

    return dbDate === uiDate && (
      c.status === "Scheduled" || 
      (c.status === "Get Slot" && (c.freeSlots?.length > 0 || c.type === "General"))
    );
  });

  const grouped = dailyComplaints.reduce((acc, curr) => {
    const cat = curr.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const handleMouseMove = (e, complaint) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    
    let startMin = DAY_START_MIN + (percent * TOTAL_MINS) - (SLOT_DURATION / 2);
    
    if (startMin < DAY_START_MIN) startMin = DAY_START_MIN;
    if (startMin + SLOT_DURATION > DAY_END_MIN) startMin = DAY_END_MIN - SLOT_DURATION;

    const snappedMin = Math.round(startMin / 5) * 5; 
    const xPos = ((snappedMin - DAY_START_MIN) / TOTAL_MINS) * 100;
    const isValid = checkIfValid(snappedMin, complaint.freeSlots);

    setHoverData({ id: complaint._id, startMin: snappedMin, xPercent: xPos, isValid });
  };

  const handleFinalize = async (id, startMin, isValid) => {
    if (!isValid) return; 
    const startStr = minToTime(startMin);
    const endStr = minToTime(startMin + SLOT_DURATION);
    try {
      await API.patch(`/complaints/${id}/schedule-visit`, { start: startStr, end: endStr });
      onUpdate();
    } catch (err) { alert("Scheduling failed"); }
  };

  const handleUnlock = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Unlock this slot to reschedule?")) return;
    try {
      await API.patch(`/complaints/${id}/manage`, { action: "Get Slot" });
      onUpdate();
    } catch (err) { alert("Unlock failed"); }
  };

  return (
    <div className="space-y-12 pb-20">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-8 bg-[#001D4C]"></div>
            <h2 className="text-sm font-black text-[#001D4C] uppercase tracking-[0.3em] flex items-center gap-2">
              <Hash size={14} /> {category} 
              <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded text-[9px] text-slate-500">{items.length} Issues</span>
            </h2>
          </div>

          <div className="grid gap-4">
            {items.map((c) => (
              <div key={c._id} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex items-center gap-8 shadow-sm">
                
                {/* CLICKABLE STUDENT INFO SECTION */}
                <div className="w-48 shrink-0">
                  <button 
                    onClick={() => onStudentClick && onStudentClick(c.student?._id)}
                    className="group/name flex flex-col items-start text-left hover:bg-slate-50 p-2 -ml-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                       <p className="text-[12px] font-black text-[#001D4C] uppercase italic leading-tight group-hover/name:text-blue-600 transition-colors">
                        {c.student?.name}
                      </p>
                      <User size={10} className="text-slate-300 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Room {c.student?.roomNumber || c.student?.roomNo}
                    </p>
                    <p className="text-[7px] text-blue-500 font-black uppercase tracking-tighter opacity-0 group-hover/name:opacity-100 transition-all mt-0.5">
                      View History →
                    </p>
                  </button>
                </div>

                <div className="flex-1 relative">
                  <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase mb-2 px-1">
                    <span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span>
                  </div>

                  <div 
                    className={`relative h-10 bg-slate-100/40 rounded-xl border border-slate-100 overflow-hidden group ${c.status === 'Scheduled' ? 'cursor-default' : 'cursor-none'}`}
                    onMouseMove={(e) => handleMouseMove(e, c)}
                    onMouseLeave={() => setHoverData({ id: null, startMin: 0, xPercent: 0, isValid: false })}
                    onClick={() => c.status !== "Scheduled" && handleFinalize(c._id, hoverData.startMin, hoverData.isValid)}
                  >
                    {c.freeSlots?.map((slot, i) => {
                      const start = timeToMin(slot.startTime) - DAY_START_MIN;
                      const end = timeToMin(slot.endTime) - DAY_START_MIN;
                      return (
                        <div 
                          key={i} 
                          className="absolute top-0 bottom-0 bg-gradient-to-b from-emerald-50 to-teal-100/80 border-x border-teal-200/50 shadow-[inset_0_0_8px_rgba(20,184,166,0.1)]"
                          style={{ left: `${(start/TOTAL_MINS)*100}%`, width: `${((end-start)/TOTAL_MINS)*100}%` }}
                        />
                      );
                    })}

                    {hoverData.id === c._id && c.status !== "Scheduled" && (
                      <div 
                        className={`absolute top-0 bottom-0 z-30 flex flex-col items-center justify-center border-x-2 transition-all duration-75 pointer-events-none
                          ${hoverData.isValid 
                            ? "bg-orange-500 border-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.4)]" 
                            : "bg-slate-300 border-slate-400 opacity-50"}`}
                        style={{ left: `${hoverData.xPercent}%`, width: `${(SLOT_DURATION/TOTAL_MINS)*100}%` }}
                      >
                        <span className="text-[7px] font-black text-white leading-none">{minToTime(hoverData.startMin)}</span>
                        <div className="h-[1px] w-4 bg-white/30 my-0.5" />
                        <span className="text-[7px] font-black text-white leading-none">{minToTime(hoverData.startMin + SLOT_DURATION)}</span>
                        {!hoverData.isValid && <AlertCircle size={10} className="text-white mt-1" />}
                      </div>
                    )}

                    {c.status === "Scheduled" && (
                      <div 
                        className="absolute top-0 bottom-0 bg-emerald-500 z-20 flex flex-col items-center justify-center border-x-2 border-emerald-600 shadow-lg group/slot"
                        style={{ 
                          left: `${((timeToMin(c.scheduledVisit?.start) - DAY_START_MIN) / TOTAL_MINS) * 100}%`, 
                          width: `${(SLOT_DURATION/TOTAL_MINS) * 100}%` 
                        }}
                      >
                        <button 
                          onClick={(e) => handleUnlock(e, c._id)}
                          className="absolute -top-1 -right-1 bg-white text-[#001D4C] rounded-full p-1.5 shadow-md scale-0 group-hover/slot:scale-100 transition-transform hover:bg-slate-50 border border-slate-100"
                          title="Reschedule Slot"
                        >
                          <Unlock size={10} />
                        </button>
                        
                        <span className="text-[7px] font-black text-white uppercase">{c.scheduledVisit?.start}</span>
                        <Check size={10} className="text-white my-0.5" />
                        <span className="text-[7px] font-black text-white uppercase">{c.scheduledVisit?.end}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {(c.status === "Scheduled" || c.type === "General") && (
                    <>
                      <button 
                        onClick={() => API.patch(`/complaints/${c._id}/resolve-reset`, { isResolved: true }).then(onUpdate)} 
                        className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all hover:shadow-lg"
                      >
                        <Check size={18}/>
                      </button>
                      <button 
                        onClick={() => API.patch(`/complaints/${c._id}/resolve-reset`, { isResolved: false }).then(onUpdate)} 
                        className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all hover:shadow-lg"
                      >
                        <X size={18}/>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}