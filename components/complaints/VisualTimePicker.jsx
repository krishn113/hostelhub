"use client";
import { useState, useMemo } from "react";
import { Clock, CheckCircle2, Circle, MousePointer2 } from "lucide-react";

export default function VisualTimePicker({ freeSlots, setFreeSlots }) {
  // 1. Setup Time Constants
  const START_HOUR = 9;
  const END_HOUR = 18;
  const CATEGORIES = [
    { id: "morning", label: "Morning", start: 9, end: 12 },
    { id: "afternoon", label: "Afternoon", start: 12, end: 15 },
    { id: "evening", label: "Evening", start: 15, end: 18 },
  ];

  // Helper: Convert total minutes from 09:00 into "HH:mm"
  const minsToTime = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Helper: Convert "HH:mm" into total minutes
  const timeToMins = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // 2. State for "Active" Category (to show the specific slot selector)
  const [activeCategory, setActiveCategory] = useState(null);

  // 3. Flatten existing ranges into individual 30-min start times for easy toggling
  const selectedStartMins = useMemo(() => {
    const starts = new Set();
    freeSlots.forEach(slot => {
      let current = timeToMins(slot.startTime);
      const end = timeToMins(slot.endTime);
      while (current < end) {
        starts.add(current);
        current += 30;
      }
    });
    return starts;
  }, [freeSlots]);

  // 4. THE MERGE LOGIC: Converts individual 30m blocks back into ranges
  const updateRanges = (newStartsSet) => {
    const sortedStarts = Array.from(newStartsSet).sort((a, b) => a - b);
    const mergedRanges = [];

    if (sortedStarts.length > 0) {
      let start = sortedStarts[0];
      let prev = sortedStarts[0];

      for (let i = 1; i < sortedStarts.length; i++) {
        if (sortedStarts[i] === prev + 30) {
          prev = sortedStarts[i];
        } else {
          mergedRanges.push({ startTime: minsToTime(start), endTime: minsToTime(prev + 30) });
          start = sortedStarts[i];
          prev = sortedStarts[i];
        }
      }
      mergedRanges.push({ startTime: minsToTime(start), endTime: minsToTime(prev + 30) });
    }
    setFreeSlots(mergedRanges);
  };

  const toggleMinuteSlot = (mins) => {
    const newSet = new Set(selectedStartMins);
    if (newSet.has(mins)) newSet.delete(mins);
    else newSet.add(mins);
    updateRanges(newSet);
  };

  const toggleCategoryAll = (cat) => {
    const newSet = new Set(selectedStartMins);
    const intervals = [];
    for (let m = cat.start * 60; m < cat.end * 60; m += 30) intervals.push(m);
    
    const allPresent = intervals.every(m => newSet.has(m));
    if (allPresent) intervals.forEach(m => newSet.delete(m));
    else intervals.forEach(m => newSet.add(m));
    
    updateRanges(newSet);
  };

  const isFullDay = selectedStartMins.size === ((END_HOUR - START_HOUR) * 2);

  return (
    <div className="space-y-6 text-white">
      {/* Full Day Toggle */}
      <button
        onClick={() => {
          const newSet = new Set();
          if (!isFullDay) {
            for (let m = START_HOUR * 60; m < END_HOUR * 60; m += 30) newSet.add(m);
          }
          updateRanges(newSet);
        }}
        className={`w-full p-4 rounded-3xl border-2 transition-all flex items-center justify-between ${
          isFullDay ? "bg-orange-500 border-orange-400" : "bg-white/5 border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock size={20} className={isFullDay ? "text-white" : "text-orange-500"} />
          <span className="text-xs font-black uppercase tracking-widest">Full Day (09:00 - 18:00)</span>
        </div>
        {isFullDay ? <CheckCircle2 size={20} /> : <Circle size={20} className="opacity-20" />}
      </button>

      {/* Category Selectors */}
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                isActive ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/5"
              }`}
            >
              <span className="text-[10px] font-black uppercase">{cat.label}</span>
              <span className="text-[8px] opacity-50">{cat.start}:00-{cat.end}:00</span>
            </button>
          );
        })}
      </div>

      {/* Visual Timeline Slot Selector */}
      {activeCategory && (
        <div className="p-6 bg-[#0a192f] rounded-3xl border border-white/10 animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500">Select 30-Min Blocks</h4>
            <button 
              onClick={() => toggleCategoryAll(CATEGORIES.find(c => c.id === activeCategory))}
              className="text-[9px] font-bold bg-white/10 px-3 py-1 rounded-full hover:bg-white/20"
            >
              Toggle All {activeCategory}
            </button>
          </div>

          <div className="relative flex w-full h-16 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            {(() => {
              const cat = CATEGORIES.find(c => c.id === activeCategory);
              const slots = [];
              for (let m = cat.start * 60; m < cat.end * 60; m += 30) {
                const isSelected = selectedStartMins.has(m);
                slots.push(
                  <button
                    key={m}
                    onClick={() => toggleMinuteSlot(m)}
                    className={`flex-1 flex flex-col items-center justify-center border-r border-white/5 transition-all relative group ${
                      isSelected ? "bg-orange-500 text-white" : "hover:bg-orange-500/20 text-blue-200/40"
                    }`}
                  >
                    <span className="text-[8px] font-black leading-none">{minsToTime(m)}</span>
                    <div className="w-4 h-[1px] bg-current my-1 opacity-30" />
                    <span className="text-[8px] font-black leading-none">{minsToTime(m + 30)}</span>
                    {!isSelected && <MousePointer2 size={10} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                );
              }
              return slots;
            })()}
          </div>
        </div>
      )}

      {/* Displaying Merged Ranges */}
      {freeSlots.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Active Schedule</p>
          <div className="flex flex-wrap gap-2">
            {freeSlots.map((slot, i) => (
              <div key={i} className="bg-orange-500/20 border border-orange-500/40 px-3 py-2 rounded-xl flex items-center gap-2">
                <span className="text-[10px] font-bold">{slot.startTime} — {slot.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}