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
  onGetSlots,
  isWarden
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
    {/* HEADER TITLE SECTION */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#001D4C] tracking-tight uppercase italic">
          MAINTENANCE HUB
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1 italic pl-1">
          Manage and schedule resolutions
        </p>
      </div>
      
      {/* If you have a "New Complaint" button, it should live here in the title row */}
    </div>

    {/* MAIN CONTROLS CONTAINER: Single row on Desktop (lg), Multi-row on Mobile */}
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
      
      {/* GROUP A: Checkbox & Search (Primary Focus) */}
      <div className="flex flex-1 items-center gap-2 md:gap-3">
        {/* Select All */}
        {!isWarden && (
          <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-center min-w-[48px] md:min-w-[56px] h-[52px]">
            <input 
              type="checkbox" 
              checked={isAllSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-slate-200 accent-[#001D4C] cursor-pointer" 
            />
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-0 lg:min-w-[200px]">
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..." 
            className="w-full bg-white border-none rounded-2xl h-[52px] pl-12 md:pl-14 pr-4 text-sm font-medium shadow-sm outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-[#001D4C]/5"
          />
        </div>
      </div>

      {/* GROUP B: Filters, Date, and Button (Secondary Controls) */}
      <div className="flex flex-[1.5] flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
        
        {/* Category Filter */}
        <div className="relative flex-1 min-w-[120px]">
          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full appearance-none bg-white px-8 md:px-10 h-[52px] rounded-2xl shadow-sm border border-slate-50 cursor-pointer text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#001D4C] outline-none"
          >
            <option value="">Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative flex-1 min-w-[120px]">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full appearance-none bg-white px-8 md:px-10 h-[52px] rounded-2xl shadow-sm border border-slate-50 cursor-pointer text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#001D4C] outline-none"
          >
            <option value="">Status</option>
            {statuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
        </div>

        {/* Date Picker */}
        {!isWarden && (
          <div className="relative flex-1 min-w-[140px]">
            <button 
              type="button"
              onClick={handleDateButtonClick}
              disabled={!isActionable}
              className={`w-full h-[52px] px-4 rounded-2xl shadow-sm border flex items-center justify-center gap-2 transition-all ${
                !isActionable ? 'opacity-30 cursor-not-allowed bg-slate-50 border-slate-100' :
                selectedDate ? 'bg-[#001D4C] text-white' : 'bg-white border-slate-200 text-[#001D4C]'
              }`}
            >
              <Calendar size={16} />
              <span className="text-[10px] font-bold uppercase truncate">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Date'}
              </span>
            </button>
            <input type="date" ref={dateInputRef} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="hidden" />
          </div>
        )}

        {/* Submit Action */}
        {!isWarden && (
          <button 
            onClick={onGetSlots}
            disabled={!selectedDate || !isActionable}
            className="flex-[1.2] bg-[#001D4C] text-white px-4 h-[52px] rounded-2xl font-bold text-[10px] uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 shrink-0"
          >
            Get Slots {selectedCount > 0 && `(${selectedCount})`}
          </button>
        )}

        {/* Global Reset - Becomes an icon-button on desktop to save space */}
        {showGlobalReset && (
          <button 
            onClick={handleGlobalReset}
            className="p-4 h-[52px] w-[52px] flex items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all shrink-0"
            title="Clear All"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </div>
  </div>
);
}