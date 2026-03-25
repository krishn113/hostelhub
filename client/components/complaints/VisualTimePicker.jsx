"use client";
import { useState, useRef } from "react";
import { Trash2, ArrowRight } from "lucide-react";

export default function VisualTimePicker({ freeSlots, setFreeSlots }) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPos, setHoverPos] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const timelineRef = useRef(null);

  // 1. Hours restricted to 9 AM - 6 PM
  const START_HOUR = 9;
  const END_HOUR = 18; 
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  const getPercentToTime = (percent) => {
    const totalMinutes = TOTAL_HOURS * 60;
    const minutesFromStart = (percent / 100) * totalMinutes;
    const h = Math.floor(minutesFromStart / 60) + START_HOUR;
    const m = Math.floor(minutesFromStart % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const timeToPercent = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h - START_HOUR) * 60 + m;
    return (totalMinutes / (TOTAL_HOURS * 60)) * 100;
  };

  const handleMouseMove = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    
    setHoverPos(percent);
    if (isDragging) setCurrentPos(percent);
  };

  const handleMouseDown = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setStartPos(percent);
    setCurrentPos(percent);
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const finalStart = Math.min(startPos, currentPos);
    const finalEnd = Math.max(startPos, currentPos);

    if (finalEnd - finalStart > 1) {
      const newSlot = { 
        startTime: getPercentToTime(finalStart), 
        endTime: getPercentToTime(finalEnd) 
      };

      const updatedSlots = [...freeSlots, newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const merged = [];
      
      if (updatedSlots.length > 0) {
        let current = updatedSlots[0];
        for (let i = 1; i < updatedSlots.length; i++) {
          if (updatedSlots[i].startTime <= current.endTime) {
            if (updatedSlots[i].endTime > current.endTime) {
              current.endTime = updatedSlots[i].endTime;
            }
          } else {
            merged.push(current);
            current = updatedSlots[i];
          }
        }
        merged.push(current);
      }
      setFreeSlots(merged);
    }
    setStartPos(null);
    setCurrentPos(null);
  };

  return (
    <div className="space-y-8">
      <div className="relative pt-10 pb-6">
        {/* Floating Time Tooltip */}
        {hoverPos !== null && (
          <div 
            className="absolute top-0 transform -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-xl transition-all duration-75 z-20"
            style={{ left: `${hoverPos}%` }}
          >
            {getPercentToTime(hoverPos)}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-500" />
          </div>
        )}

        <div className="flex justify-between mb-4 px-1">
          <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest">09:00 AM</span>
          <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest text-center">Maintenance Window</span>
          <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest">06:00 PM</span>
        </div>

        <div 
          ref={timelineRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setHoverPos(null)}
          className="h-14 bg-white/5 rounded-2xl border border-white/10 relative cursor-crosshair overflow-hidden select-none"
        >
          {/* Hour Markers */}
          {[...Array(TOTAL_HOURS + 1)].map((_, i) => (
            <div 
              key={i} 
              className="absolute top-0 bottom-0 w-[1px] bg-white/10" 
              style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
            />
          ))}

          {/* Visual Highlight for existing slots */}
          {freeSlots.map((slot, i) => (
            <div 
              key={i}
              className="absolute h-full bg-blue-400/20 border-x border-blue-400/40"
              style={{ 
                left: `${timeToPercent(slot.startTime)}%`, 
                width: `${timeToPercent(slot.endTime) - timeToPercent(slot.startTime)}%` 
              }}
            />
          ))}

          {/* Current Dragging Highlight */}
          {isDragging && (
            <div 
              className="absolute h-full bg-blue-500/50 border-x-2 border-white flex items-center justify-center z-10"
              style={{ 
                left: `${Math.min(startPos, currentPos)}%`, 
                width: `${Math.abs(currentPos - startPos)}%` 
              }}
            >
               <span className="text-[8px] font-black bg-[#001D4C] px-2 py-0.5 rounded shadow">SELECTING</span>
            </div>
          )}
        </div>
      </div>

      {/* List of Generated Slots with Custom Tailwind Scrollbar */}
      <div className="space-y-3 max-h-52 overflow-y-auto pr-3 
        /* Custom Scrollbar Styles */
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-track]:my-2
        [&::-webkit-scrollbar-thumb]:bg-blue-500/20
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/40
        transition-all"
      >
        {freeSlots.map((slot, idx) => (
          <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 group animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[8px] text-blue-400 font-bold uppercase mb-1">Start</span>
                  <span className="text-sm font-black tracking-widest">{slot.startTime}</span>
               </div>
               <ArrowRight size={16} className="text-blue-500/50" />
               <div className="flex flex-col">
                  <span className="text-[8px] text-blue-400 font-bold uppercase mb-1">End</span>
                  <span className="text-sm font-black tracking-widest">{slot.endTime}</span>
               </div>
            </div>
            <button 
              onClick={() => setFreeSlots(freeSlots.filter((_, i) => i !== idx))}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {freeSlots.length === 0 && (
          <p className="text-center text-blue-300/20 text-[10px] uppercase font-bold py-8 tracking-widest">
            No slots painted yet
          </p>
        )}
      </div>
    </div>
  );
}