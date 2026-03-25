"use client";
import { Search, Calendar, ChevronDown, Filter, RotateCcw, X } from "lucide-react"; 
import { useRef } from "react";

export default function CaretakerHubHeader({ 
  selectedCount, 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters,
  onClearFilters,
  onSelectAll,
  isAllSelected,
  selectedDate, 
  setSelectedDate, 
  onClearSelection,
  onGetSlots
}) {
  const dateInputRef = useRef(null);
  const isActionable = selectedCount > 0;
  const today = new Date().toISOString().split('T')[0];

  const categories = ["Electrical", "Plumbing", "Carpentry", "Wifi/Lan", "Others"];
  const statuses = ["Raised", "Scheduled", "Resolved", "Get Slot"];

  const showGlobalReset = searchQuery || filters.category || filters.status || selectedDate || selectedCount > 0;

  const handleGlobalReset = () => {
    onClearFilters(); 
    setSelectedDate("");
    onClearSelection();
    setSearchQuery("");
  };

  // The "Magic" function to open the calendar
  const handleDateButtonClick = () => {
    if (isActionable && dateInputRef.current) {
      // This triggers the native browser calendar
      dateInputRef.current.showPicker();
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#001D4C] tracking-tight uppercase">
            MAINTENANCE HUB
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1 italic pl-1">
            System Overview & Control
          </p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        {/* Select All */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-center min-w-[56px]">
          <input 
            type="checkbox" 
            checked={isAllSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-slate-200 accent-[#001D4C] cursor-pointer" 
          />
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search residents or issues..." 
            className="w-full bg-white border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-medium shadow-sm outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-[#001D4C]/5"
          />
        </div>

        {/* Filters */}
        <div className="relative">
            <select 
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="appearance-none bg-white px-10 py-4 rounded-2xl shadow-sm border border-slate-50 cursor-pointer text-[11px] font-bold uppercase tracking-widest text-[#001D4C] outline-none min-w-[140px]"
            >
              <option value="">Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
        </div>

        <div className="relative">
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="appearance-none bg-white px-10 py-4 rounded-2xl shadow-sm border border-slate-50 cursor-pointer text-[11px] font-bold uppercase tracking-widest text-[#001D4C] outline-none min-w-[140px]"
            >
              <option value="">Status</option>
              {statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
        </div>

        {/* Unified Reset */}
        {showGlobalReset && (
          <button 
            onClick={handleGlobalReset}
            className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100 group shadow-sm"
          >
            <RotateCcw size={16} className="group-hover:rotate-[-90deg] transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Clear All</span>
          </button>
        )}

        <div className="h-8 w-[1px] bg-slate-200 mx-2" />

        {/* Action Group */}
        <div className="flex items-center gap-3">
          
          {/* THE FIXED DATE PICKER BUTTON */}
          <div className="relative h-[52px]">
              <button 
                type="button"
                onClick={handleDateButtonClick}
                disabled={!isActionable}
                className={`h-full px-5 rounded-2xl shadow-sm border flex items-center justify-center gap-3 min-w-[160px] transition-all ${
                  !isActionable ? 'opacity-30 cursor-not-allowed bg-slate-50 border-slate-100 text-slate-300' :
                  selectedDate ? 'bg-[#001D4C] border-[#001D4C] text-white' : 'bg-white border-slate-200 text-[#001D4C] hover:border-[#001D4C]'
                }`}
              >
                  <Calendar size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    {selectedDate 
                      ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) 
                      : 'Pick Date'}
                  </span>
                  {selectedDate && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); setSelectedDate(""); }}
                      className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors"
                    >
                      <X size={14} />
                    </div>
                  )}
              </button>
              
              {/* This input is hidden but used by the ref */}
              <input 
                  type="date"
                  ref={dateInputRef}
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute left-0 top-0 w-0 h-0 opacity-0 pointer-events-none"
                  style={{ visibility: 'hidden' }}
              />
          </div>
          
          <button 
            onClick={onGetSlots}
            disabled={!selectedDate || !isActionable}
            className="bg-[#001D4C] text-white px-8 h-[52px] rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-blue-900/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed border border-[#001D4C]"
          >
              Get Slots {selectedCount > 0 && `(${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}