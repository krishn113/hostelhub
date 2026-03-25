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
      {/* Top Row: Title & Action */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#001D4C] tracking-tight uppercase italic">
          MAINTENANCE HUB
        </h1>
        
        <button 
          onClick={onNewClick}
          className="bg-[#001D4C] text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-90 transition-all shadow-md shadow-blue-900/10"
        >
          <Plus size={18} />
          <span className="font-bold text-[11px] uppercase tracking-wider">New Complaint</span>
        </button>
      </div>

      {/* Middle Row: Search | Status Filter | Calendar */}
      <div className="flex gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-medium shadow-sm focus:ring-2 focus:ring-[#001D4C]/10 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-50 cursor-pointer hover:bg-slate-50 transition-all min-w-[160px]"
          >
            <Filter size={14} className="text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#001D4C]">
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
        
{/* Calendar Filter */}
<div className="relative bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-50 overflow-hidden flex items-center justify-center">
  {/* Icon - pointer-events-none lets clicks "pass through" to the input */}
  <Calendar size={20} className="text-[#001D4C] pointer-events-none relative z-0" />
  
  <input 
    type="date"
    value={selectedDate || ""} 
    onChange={(e) => setSelectedDate(e.target.value)}
    className="custom-date-input absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
  />

  {selectedDate && (
    <div className="absolute top-2 right-2 z-20 pointer-events-none">
      <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white shadow-sm" />
    </div>
  )}
</div>
        {isFiltered && (
          <button 
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100 animate-in fade-in slide-in-from-right-2"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Clear</span>
            <div className="h-4 w-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
              ×
            </div>
          </button>
        )}
      </div>
    </div>
  );
}