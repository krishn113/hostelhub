"use client";
import { useState } from "react";
import { Search, Calendar, Plus, ChevronDown, Filter } from "lucide-react";

export default function HubHeader({ 
  onNewClick, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  selectedDate,
  setSelectedDate,
  onClear
}) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statuses = ["All Issues", "Raised", "Get Slot", "Scheduled", "Resolved"];

  // Check if any filter is active
  const isFiltered = searchTerm !== "" || statusFilter !== "All Issues" || selectedDate !== "";

  return (
  <div className="flex flex-col gap-6 mb-6">
    {/* TOP ROW: Title and New Complaint Button */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl md:text-3xl font-bold text-[#001D4C] tracking-tight uppercase italic">
        MAINTENANCE HUB
      </h1>
      
      <button 
        onClick={onNewClick}
        className="w-full sm:w-auto bg-[#001D4C] text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-md shadow-blue-900/10 order-first sm:order-none"
      >
        <Plus size={18} />
        <span className="font-bold text-[11px] uppercase tracking-wider">New Complaint</span>
      </button>
    </div>

    {/* CONTROLS ROW: Single Line on Desktop (lg), Multi-line on Mobile */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
      
      {/* SEARCH BAR - Occupies 5 out of 12 columns on desktop */}
      <div className="relative lg:col-span-5">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by title or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-medium shadow-sm focus:ring-2 focus:ring-[#001D4C]/10 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* FILTER GROUP - Occupies 7 out of 12 columns on desktop */}
      <div className="lg:col-span-7 flex flex-row items-center gap-2 lg:gap-4">
        
        {/* Status Filter Dropdown */}
        <div className="relative flex-1">
          <div 
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-3 bg-white px-4 lg:px-5 py-4 rounded-2xl shadow-sm border border-slate-50 cursor-pointer hover:bg-slate-50 transition-all min-h-[52px]"
          >
            <Filter size={14} className="text-slate-400 shrink-0" />
            <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-[#001D4C] truncate">
              {statusFilter}
            </span>
            <ChevronDown size={14} className={`text-blue-500 ml-auto transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
          </div>

          {showStatusDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-50 z-50 overflow-hidden">
              {statuses.map((status) => (
                <div 
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                  className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-[#001D4C] cursor-pointer"
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Calendar Filter - Fixed width icon square */}
        <div className="relative bg-white h-[52px] w-[52px] lg:w-14 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-50 overflow-hidden flex items-center justify-center shrink-0">
          <Calendar size={20} className="text-[#001D4C] pointer-events-none" />
          <input 
            type="date"
            value={selectedDate || ""} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
          />
          {selectedDate && (
            <div className="absolute top-2 right-2">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 border border-white" />
            </div>
          )}
        </div>

        {/* Clear Button */}
        {isFiltered && (
          <button 
            onClick={onClear}
            className="flex items-center justify-center gap-2 px-4 h-[52px] rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100 shrink-0"
          >
            <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest">Clear</span>
            <div className="h-4 w-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
              ×
            </div>
          </button>
        )}
      </div>
    </div>
  </div>
);
}