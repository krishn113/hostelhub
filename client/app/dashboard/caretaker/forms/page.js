"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ListTodo, Building2, DoorOpen, Search, RotateCcw, CalendarDays, Users, Home, Phone, X } from "lucide-react";
import API from "@/lib/api";

export default function CaretakerForms() {
  const [activeTab, setActiveTab] = useState("leaving");
  const [leavingForms, setLeavingForms] = useState([]);
  const [guestForms, setGuestForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [leavingSearch, setLeavingSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [arrivalFilter, setArrivalFilter] = useState("");
  const [departureFilter, setDepartureFilter] = useState("");
  const [bookingOnFilter, setBookingOnFilter] = useState("");

  // History Modal States
  const [selectedHistory, setSelectedHistory] = useState(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const leavingRes = await API.get("/caretaker/forms/hostel-leaving");
      const guestRes = await API.get("/caretaker/forms/guesthouse");
      if (leavingRes.data) setLeavingForms(leavingRes.data);
      if (guestRes.data) {
        const sortedGuest = [...guestRes.data].sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
        setGuestForms(sortedGuest);
      }
    } catch (error) {
      console.error("Failed to fetch caretaker forms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, []);

  // Filter Logic for Hostel Leaving
  const filteredLeaving = leavingForms.filter(form => {
    const query = leavingSearch.trim().toLowerCase();
    const nameMatch = !query ||
      (form.applicantName || form.studentId?.name || "").toLowerCase().includes(query) ||
      (form.applicantEntryNo || form.studentId?.entryNumber || "").toLowerCase().includes(query);

    // "Leave On" range filter
    let dateMatch = true;
    if (dateFilter) {
      const selected = new Date(dateFilter); selected.setHours(0, 0, 0, 0);
      const leaving = new Date(form.leavingDate); leaving.setHours(0, 0, 0, 0);
      const returning = new Date(form.returnDate); returning.setHours(0, 0, 0, 0);
      dateMatch = leaving <= selected && selected <= returning;
    }

    // From date filter — leavingDate must be >= fromDate
    let fromMatch = true;
    if (fromDateFilter) {
      const from = new Date(fromDateFilter); from.setHours(0, 0, 0, 0);
      const leaving = new Date(form.leavingDate); leaving.setHours(0, 0, 0, 0);
      fromMatch = leaving >= from;
    }

    // To date filter — leavingDate must be <= toDate
    let toMatch = true;
    if (toDateFilter) {
      const to = new Date(toDateFilter); to.setHours(23, 59, 59, 999);
      const leaving = new Date(form.leavingDate); leaving.setHours(0, 0, 0, 0);
      toMatch = leaving <= to;
    }

    return nameMatch && dateMatch && fromMatch && toMatch;
  });

  // Filter Logic for Guest House
  const filteredGuest = guestForms.filter(form => {
    const arrivalMatch = !arrivalFilter || new Date(form.arrivalDate).toLocaleDateString() === new Date(arrivalFilter).toLocaleDateString();
    const departureMatch = !departureFilter || new Date(form.departureDate).toLocaleDateString() === new Date(departureFilter).toLocaleDateString();
    let bookingOnMatch = true;
    if (bookingOnFilter) {
      const selected = new Date(bookingOnFilter); selected.setHours(0, 0, 0, 0);
      const arrival = new Date(form.arrivalDate); arrival.setHours(0, 0, 0, 0);
      const departure = new Date(form.departureDate); departure.setHours(0, 0, 0, 0);
      bookingOnMatch = arrival <= selected && selected <= departure;
    }
    return arrivalMatch && departureMatch && bookingOnMatch;
  });

  const getStudentHistory = () => {
    if (!selectedHistory) return [];
    if (selectedHistory.type === "leaving") {
      return leavingForms.filter(f =>
        (f.applicantName || f.studentId?.name || "Unknown") === selectedHistory.name &&
        (f.applicantEntryNo || f.studentId?.entryNumber || "N/A") === selectedHistory.entryNo
      ).sort((a, b) => new Date(b.leavingDate) - new Date(a.leavingDate));
    } else {
      return guestForms.filter(f =>
        (f.applicantName || f.studentId?.name || "Unknown") === selectedHistory.name &&
        (f.applicantEntryNo || f.studentId?.entryNumber || "N/A") === selectedHistory.entryNo
      ).sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
    }
  };

  const hasLeavingFilters = leavingSearch || dateFilter || fromDateFilter || toDateFilter;
  const hasGuestFilters = arrivalFilter || departureFilter || bookingOnFilter;

  const todayOnLeave = leavingForms.filter(f => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const leaving = new Date(f.leavingDate); leaving.setHours(0, 0, 0, 0);
    const returning = new Date(f.returnDate); returning.setHours(0, 0, 0, 0);
    return leaving <= today && today <= returning;
  }).length;

  const currentBookings = guestForms.filter(f => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const arrival = new Date(f.arrivalDate); arrival.setHours(0, 0, 0, 0);
    const departure = new Date(f.departureDate); departure.setHours(0, 0, 0, 0);
    return arrival <= today && today <= departure;
  }).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <DashboardLayout role="caretaker" activeTab="forms">
      <div className="max-w-6xl mx-auto space-y-6 pb-8 px-4 animate-in fade-in duration-700">

        {/* HEADER & STATS */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 w-full pt-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase mb-2">Student Forms</h1>
            <p className="text-slate-500 font-medium text-sm">Monitoring leave and booking applications across the hostel.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: "On Leave", val: todayOnLeave, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: DoorOpen },
              { label: "Active Bookings", val: currentBookings, color: "text-indigo-500", bg: "bg-indigo-500/10", icon: Building2 },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm bg-white text-slate-800 transition-all hover:shadow-md">
                <div className={`p-2 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <div className="flex flex-col justify-center translate-y-[1px]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{s.label}</span>
                  <span className="text-xl font-black leading-none tracking-tighter">{s.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-col gap-4">
          {/* Tab switcher row */}
          <div className="flex space-x-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab("leaving")}
              className={`py-2 px-5 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all ${
                activeTab === "leaving" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Hostel Leaving
            </button>
            <button
              onClick={() => setActiveTab("guesthouse")}
              className={`py-2 px-5 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all ${
                activeTab === "guesthouse" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Guest House
            </button>
          </div>

          {/* FILTERS — own row, wraps naturally */}
          {activeTab === "leaving" && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search name or entry no."
                  value={leavingSearch}
                  onChange={(e) => setLeavingSearch(e.target.value)}
                  className="w-52 bg-white border border-slate-100 rounded-2xl py-2.5 pl-9 pr-8 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none shadow-sm transition-all placeholder:text-slate-400 placeholder:font-medium"
                />
                {leavingSearch && (
                  <button onClick={() => setLeavingSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* From date */}
              <div className={`flex items-center gap-2 bg-white border rounded-2xl py-2.5 px-4 shadow-sm transition-all ${fromDateFilter ? "border-blue-400 bg-blue-50/30" : "border-slate-100"}`}>
                <CalendarDays size={14} className="text-slate-400 shrink-0" />
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">From</span>
                <input
                  type="date"
                  value={fromDateFilter}
                  onChange={(e) => setFromDateFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
                />
                {fromDateFilter && (
                  <button onClick={() => setFromDateFilter("")} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* To date */}
              <div className={`flex items-center gap-2 bg-white border rounded-2xl py-2.5 px-4 shadow-sm transition-all ${toDateFilter ? "border-blue-400 bg-blue-50/30" : "border-slate-100"}`}>
                <CalendarDays size={14} className="text-slate-400 shrink-0" />
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">To</span>
                <input
                  type="date"
                  value={toDateFilter}
                  onChange={(e) => setToDateFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
                />
                {toDateFilter && (
                  <button onClick={() => setToDateFilter("")} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Leave On (range) */}
              <div className={`flex items-center gap-2 bg-white border rounded-2xl py-2.5 px-4 shadow-sm transition-all ${dateFilter ? "border-blue-400 bg-blue-50/30" : "border-slate-100"}`}>
                <CalendarDays size={14} className="text-slate-400 shrink-0" />
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Leave On</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
                />
                {dateFilter && (
                  <button onClick={() => setDateFilter("")} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>

              {hasLeavingFilters && (
                <button
                  onClick={() => { setLeavingSearch(""); setDateFilter(""); setFromDateFilter(""); setToDateFilter(""); }}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm whitespace-nowrap"
                >
                  <RotateCcw size={12} /> Clear Filters
                </button>
              )}
            </div>
          )}

          {activeTab === "guesthouse" && (
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: "Arrival", val: arrivalFilter, set: setArrivalFilter },
                { label: "Departure", val: departureFilter, set: setDepartureFilter },
                { label: "Booked On", val: bookingOnFilter, set: setBookingOnFilter },
              ].map(({ label, val, set }) => (
                <div key={label} className={`flex items-center gap-2 bg-white border rounded-2xl py-2.5 px-4 shadow-sm transition-all ${val ? "border-indigo-400 bg-indigo-50/30" : "border-slate-100"}`}>
                  <CalendarDays size={14} className="text-slate-400 shrink-0" />
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">{label}</span>
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
                  />
                  {val && (
                    <button onClick={() => set("")} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              {hasGuestFilters && (
                <button
                  onClick={() => { setArrivalFilter(""); setDepartureFilter(""); setBookingOnFilter(""); }}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm whitespace-nowrap"
                >
                  <RotateCcw size={12} /> Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading forms...</p>
          </div>
        ) : (
          <div className="space-y-3">

            {/* LEAVING FORMS */}
            {activeTab === "leaving" && (
              filteredLeaving.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No leaving forms match the selection.</p>
                </div>
              ) : (
                filteredLeaving.map(form => {
                  const name = form.applicantName || form.studentId?.name || "Unknown";
                  const entryNo = form.applicantEntryNo || form.studentId?.entryNumber || "N/A";
                  return (
                    <div
                      key={form._id}
                      onClick={() => setSelectedHistory({ name, entryNo, type: "leaving" })}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200 cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* LEFT: Name + Entry */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{name}</p>
                            <p className="text-[10px] font-bold text-slate-400 font-mono">{entryNo} {form.applicantDepartment && `· ${form.applicantDepartment}`}</p>
                          </div>
                        </div>

                        {/* CENTER: Dates */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold sm:mx-4">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
                            {new Date(form.leavingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg">
                            {new Date(form.returnDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                          {form.duration && (
                            <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg">{form.duration}d</span>
                          )}
                        </div>

                        {/* RIGHT: Reason + Status */}
                        <div className="flex items-center gap-3 sm:ml-auto shrink-0">
                          <p className="text-xs text-slate-500 italic truncate max-w-[140px] hidden md:block">{form.reason}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {/* GUEST HOUSE FORMS */}
            {activeTab === "guesthouse" && (
              filteredGuest.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 shadow-sm">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No guest house bookings found.</p>
                </div>
              ) : (
                filteredGuest.map(form => {
                  const name = form.applicantName || form.studentId?.name || "Unknown";
                  const entryNo = form.applicantEntryNo || form.studentId?.entryNumber || "N/A";
                  return (
                    <div
                      key={form._id}
                      onClick={() => setSelectedHistory({ name, entryNo, type: "guest" })}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* LEFT: Applicant */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{name}</p>
                            <p className="text-[10px] font-bold text-slate-400 font-mono">{entryNo} {form.applicantDepartment && `· ${form.applicantDepartment}`}</p>
                          </div>
                        </div>

                        {/* CENTER: Guest + Room */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold sm:mx-4">
                          <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">
                            <Users size={10} /> {form.guestName}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg">
                            <Home size={10} /> {form.roomToBeBooked || form.roomType || "N/A"}
                          </span>
                          <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg">
                            {form.numGuests}G · {form.numRooms}R
                          </span>
                        </div>

                        {/* RIGHT: Dates */}
                        <div className="flex items-center gap-2 sm:ml-auto shrink-0 text-[11px] font-bold">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg hidden sm:inline">
                            {new Date(form.arrivalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="text-slate-300 hidden sm:inline">→</span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg hidden sm:inline">
                            {new Date(form.departureDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                          {form.paymentByGuest && (
                            <span className="text-[9px] font-black px-2 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 uppercase tracking-widest">Pays Direct</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        )}
      </div>

      {/* HISTORY MODAL */}
      {selectedHistory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Application History</p>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedHistory.name}</h2>
                <p className="text-xs font-bold text-slate-400 font-mono mt-0.5">{selectedHistory.entryNo}</p>
              </div>
              <button
                onClick={() => setSelectedHistory(null)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Past {selectedHistory.type === "leaving" ? "Leaves" : "Bookings"}
                </h3>
                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                  {getStudentHistory().length} total
                </span>
              </div>

              <div className="space-y-2">
                {getStudentHistory().map((hist, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                        #{getStudentHistory().length - idx}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {selectedHistory.type === "leaving"
                            ? `${new Date(hist.leavingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} → ${new Date(hist.returnDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
                            : `${new Date(hist.arrivalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} → ${new Date(hist.departureDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
                          }
                        </p>
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          {selectedHistory.type === "leaving" ? hist.reason : hist.roomToBeBooked || hist.roomType}
                        </p>
                      </div>
                    </div>
                    {hist.duration && (
                      <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                        {hist.duration} {selectedHistory.type === "leaving" ? "days" : "guests"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click outside or close to return</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
