"use client";
import React, { useState } from "react";
import { Check, X, Unlock, AlertCircle, Hash, User } from "lucide-react";
import API from "@/lib/api";

const DAY_START_MIN = 9 * 60; // 9:00 AM
const DAY_END_MIN = 18 * 60;  // 6:00 PM
const TOTAL_MINS = DAY_END_MIN - DAY_START_MIN;
const SLOT_DURATION = 30; // 30 mins

export default function CaretakerScheduleTable({ complaints, onUpdate, selectedDate, onStudentClick, isWarden }) {
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
    } catch (err) { 
      alert(err.response?.data?.message || "Scheduling failed"); 
    }
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
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase px-1">
                    <span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span>
                  </div>

                  <div 
                    className={`relative h-10 bg-slate-100/40 rounded-xl border border-slate-100 overflow-hidden group ${c.status === 'Scheduled' || isWarden ? 'cursor-default' : 'cursor-none'}`}
                    onMouseMove={(e) => !isWarden && handleMouseMove(e, c)}
                    onMouseLeave={() => !isWarden && setHoverData({ id: null, startMin: 0, xPercent: 0, isValid: false })}
                    onClick={() => !isWarden && c.status !== "Scheduled" && handleFinalize(c._id, hoverData.startMin, hoverData.isValid)}
                  >
                    {c.freeSlots?.map((slot, i) => {
                      const start = timeToMin(slot.startTime) - DAY_START_MIN;
                      const end = timeToMin(slot.endTime) - DAY_START_MIN;
                      return (
                        <div 
                          key={i} 
                          className="absolute top-0 bottom-0 bg-gradient-to-b from-emerald-50 to-teal-100/80 border-x border-teal-200/50"
                          style={{ left: `${(start/TOTAL_MINS)*100}%`, width: `${((end-start)/TOTAL_MINS)*100}%` }}
                        />
                      );
                    })}

                    {hoverData.id === c._id && c.status !== "Scheduled" && (
                      <div 
                        className={`absolute top-0 bottom-0 z-30 flex flex-col items-center justify-center border-x-2 transition-all duration-75 pointer-events-none
                          ${hoverData.isValid ? "bg-orange-500 border-orange-600" : "bg-slate-300 border-slate-400 opacity-50"}`}
                        style={{ left: `${hoverData.xPercent}%`, width: `${(SLOT_DURATION/TOTAL_MINS)*100}%` }}
                      >
                        <span className="text-[7px] font-black text-white">{minToTime(hoverData.startMin)}</span>
                        <div className="h-[1px] w-4 bg-white/30 my-0.5" />
                        <span className="text-[7px] font-black text-white">{minToTime(hoverData.startMin + SLOT_DURATION)}</span>
                      </div>
                    )}

                    {c.status === "Scheduled" && (
                      <div 
                        className="absolute top-0 bottom-0 bg-emerald-500 z-20 flex flex-col items-center justify-center border-x-2 border-emerald-600 group/slot"
                        style={{ 
                          left: `${((timeToMin(c.scheduledVisit?.start) - DAY_START_MIN) / TOTAL_MINS) * 100}%`, 
                          width: `${(SLOT_DURATION/TOTAL_MINS) * 100}%` 
                        }}
                      >
                        {!isWarden && (
                          <button 
                            onClick={(e) => handleUnlock(e, c._id)}
                            className="absolute -top-1 -right-1 bg-white text-[#001D4C] rounded-full p-1.5 shadow-md scale-0 group-hover/slot:scale-100 transition-transform"
                          >
                            <Unlock size={10} />
                          </button>
                        )}
                        <span className="text-[7px] font-black text-white">{c.scheduledVisit?.start}</span>
                        <Check size={10} className="text-white my-0.5" />
                        <span className="text-[7px] font-black text-white">{c.scheduledVisit?.end}</span>
                      </div>
                    )}
                  </div>

                  {/* TEXTBOX INPUT SECTION */}
                  {c.status !== "Scheduled" && !isWarden && (
                    <div className="flex items-center justify-between bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                      <div className="flex flex-wrap gap-2">
                        {c.freeSlots?.map((slot, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-teal-100 rounded-lg shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <span className="text-[9px] font-black text-teal-700">{slot.startTime} — {slot.endTime}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                          <input 
                            type="time" 
                            className="text-[10px] font-bold text-[#001D4C] outline-none bg-transparent"
                            value={hoverData.id === c._id ? minToTime(hoverData.startMin) : "09:00"}
                            onChange={(e) => {
                                const mins = timeToMin(e.target.value);
                                setHoverData({ 
                                    id: c._id, 
                                    startMin: mins, 
                                    xPercent: ((mins - DAY_START_MIN) / TOTAL_MINS) * 100,
                                    isValid: checkIfValid(mins, c.freeSlots)
                                });
                            }}
                          />
                          <span className="mx-1 text-slate-300 text-[10px]">—</span>
                          <input 
                            type="time" 
                            className="text-[10px] font-bold text-[#001D4C] outline-none bg-transparent opacity-50"
                            value={hoverData.id === c._id ? minToTime(hoverData.startMin + SLOT_DURATION) : "09:30"}
                            readOnly 
                          />
                        </div>
                        <button 
                          onClick={() => handleFinalize(c._id, hoverData.startMin, hoverData.isValid)}
                          disabled={!hoverData.isValid || hoverData.id !== c._id}
                          className="p-2 bg-[#001D4C] text-white rounded-xl disabled:opacity-20 transition-all"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {!isWarden && (c.status === "Scheduled" || c.type === "General") && (
                    <>
                      <button 
                        onClick={() => API.patch(`/complaints/${c._id}/resolve-reset`, { isResolved: true }).then(onUpdate)} 
                        className="p-3 bg-emerald-500 text-white rounded-xl"
                      >
                        <Check size={18}/>
                      </button>
                      <button 
                        onClick={() => API.patch(`/complaints/${c._id}/resolve-reset`, { isResolved: false }).then(onUpdate)} 
                        className="p-3 bg-rose-500 text-white rounded-xl"
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