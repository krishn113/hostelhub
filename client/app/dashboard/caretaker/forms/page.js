"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ListTodo, Building2, DoorOpen } from "lucide-react";
import API from "@/lib/api";

export default function CaretakerForms() {
  const [activeTab, setActiveTab] = useState("leaving");
  const [leavingForms, setLeavingForms] = useState([]);
  const [guestForms, setGuestForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [leavingSearch, setLeavingSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [arrivalFilter, setArrivalFilter] = useState("");
  const [departureFilter, setDepartureFilter] = useState("");
  const [bookingOnFilter, setBookingOnFilter] = useState("");

  // History Modal States
  const [selectedHistory, setSelectedHistory] = useState(null); // { name, entryNo, type: 'leaving' | 'guest' }

  const fetchForms = async () => {
    try {
      setLoading(true);
      const leavingRes = await API.get("/caretaker/forms/hostel-leaving");
      const guestRes = await API.get("/caretaker/forms/guesthouse");

      if (leavingRes.data) {
        setLeavingForms(leavingRes.data);
      }
      if (guestRes.data) {
        // Sort guest forms by arrival date (newest first)
        const sortedGuest = [...guestRes.data].sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
        setGuestForms(sortedGuest);
      }
    } catch (error) {
      console.error("Failed to fetch caretaker forms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const endpoint = activeTab === "leaving"
        ? `/caretaker/forms/hostel-leaving/${id}/status`
        : `/caretaker/forms/guesthouse/${id}/status`;

      await API.patch(endpoint, { status });
      // Refresh forms after update
      fetchForms();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Filter Logic for Hostel Leaving
  const filteredLeaving = leavingForms.filter(form => {
    const query = leavingSearch.trim().toLowerCase();
    const nameMatch = !query ||
      (form.applicantName || form.studentId?.name || "").toLowerCase().includes(query) ||
      (form.applicantEntryNo || form.studentId?.entryNumber || "").toLowerCase().includes(query);

    // Date filter: show students who were LEAVE on the selected date
    // i.e. leavingDate <= selectedDate <= returnDate
    let dateMatch = true;
    if (dateFilter) {
      const selected = new Date(dateFilter);
      selected.setHours(0, 0, 0, 0);
      const leaving = new Date(form.leavingDate);
      const returning = new Date(form.returnDate);
      leaving.setHours(0, 0, 0, 0);
      returning.setHours(0, 0, 0, 0);
      dateMatch = leaving <= selected && selected <= returning;
    }

    return nameMatch && dateMatch;
  });

  // Filter Logic for Guest House
  const filteredGuest = guestForms.filter(form => {
    const arrivalMatch = !arrivalFilter || new Date(form.arrivalDate).toLocaleDateString() === new Date(arrivalFilter).toLocaleDateString();
    const departureMatch = !departureFilter || new Date(form.departureDate).toLocaleDateString() === new Date(departureFilter).toLocaleDateString();

    // Booking On Filter: check if selected date is between arrival and departure
    let bookingOnMatch = true;
    if (bookingOnFilter) {
      const selected = new Date(bookingOnFilter);
      selected.setHours(0, 0, 0, 0);
      const arrival = new Date(form.arrivalDate);
      const departure = new Date(form.departureDate);
      arrival.setHours(0, 0, 0, 0);
      departure.setHours(0, 0, 0, 0);
      bookingOnMatch = arrival <= selected && selected <= departure;
    }

    return arrivalMatch && departureMatch && bookingOnMatch;
  });

  // Helper to get history for the selected student
  const getStudentHistory = () => {
    if (!selectedHistory) return [];

    if (selectedHistory.type === 'leaving') {
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

  return (
    <DashboardLayout role="caretaker" activeTab="forms">
      <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(circle_at_top_right,_#f1f5f9_0%,_#f8fafc_100%)] p-4 md:p-8 animate-in fade-in duration-700">

        {/* HEADER SECTION */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                <span className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200"><ListTodo size={28} /></span>
                Student Forms
              </h1>
              <p className="text-slate-500 font-medium italic pl-1">Monitoring leave and booking applications across the hostel.</p>
            </div>

            {/* QUICK STATS */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-5 rounded-[2rem] shadow-xl shadow-emerald-100 border border-emerald-400/20 group hover:scale-105 transition-transform duration-300">
                <p className="text-[10px] font-black uppercase text-emerald-50 tracking-[0.2em] mb-2 opacity-80">Currently on Leave</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-white leading-none">
                    {leavingForms.filter(f => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const leaving = new Date(f.leavingDate);
                      const returning = new Date(f.returnDate);
                      leaving.setHours(0, 0, 0, 0);
                      returning.setHours(0, 0, 0, 0);
                      return leaving <= today && today <= returning;
                    }).length}
                  </p>
                  <span className="text-emerald-200 text-xs font-bold mb-1 uppercase tracking-wider">Students</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-8 py-5 rounded-[2rem] shadow-xl shadow-indigo-100 border border-indigo-400/20 group hover:scale-105 transition-transform duration-300">
                <p className="text-[10px] font-black uppercase text-indigo-50 tracking-[0.2em] mb-2 opacity-80">Current Bookings</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-white leading-none">
                    {guestForms.filter(f => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const arrival = new Date(f.arrivalDate);
                      const departure = new Date(f.departureDate);
                      arrival.setHours(0, 0, 0, 0);
                      departure.setHours(0, 0, 0, 0);
                      return arrival <= today && today <= departure;
                    }).length}
                  </p>
                  <span className="text-indigo-200 text-xs font-bold mb-1 uppercase tracking-wider">Guests</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN FEED */}
        <div className="max-w-6xl mx-auto">

          {/* TABS & FILTERS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div className="flex space-x-2 bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border-2 border-slate-200 shadow-sm w-fit overflow-x-auto">
              <button
                onClick={() => setActiveTab("leaving")}
                className={`py-3 px-8 font-black uppercase tracking-[0.15em] text-[11px] rounded-[2rem] transition-all duration-300 ${activeTab === "leaving"
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105"
                    : "text-slate-500 hover:bg-white hover:text-blue-600"
                  }`}
              >
                Hostel Leaving
              </button>
              <button
                onClick={() => setActiveTab("guesthouse")}
                className={`py-3 px-8 font-black uppercase tracking-[0.15em] text-[11px] rounded-[2rem] transition-all duration-300 ${activeTab === "guesthouse"
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105"
                    : "text-slate-500 hover:bg-white hover:text-indigo-600"
                  }`}
              >
                Guest House Bookings
              </button>
            </div>

            {/* FILTERS UI (Hostel Leaving) */}
            {activeTab === "leaving" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Name / Entry Search */}
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-[2rem] border-2 border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:shadow-md focus-within:shadow-blue-50 transition-all duration-300">
                  <span className="text-blue-500 text-lg shrink-0">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name or entry no."
                    value={leavingSearch}
                    onChange={(e) => setLeavingSearch(e.target.value)}
                    className="bg-transparent border-none text-[13px] font-bold text-slate-700 focus:outline-none w-56 placeholder:text-slate-400 placeholder:font-semibold"
                  />
                  {leavingSearch && (
                    <button onClick={() => setLeavingSearch("")} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                  )}
                </div>

                {/* Date Filter */}
                <div className={`flex items-center gap-3 bg-white px-6 py-2 rounded-[2rem] border-2 shadow-sm transition-all duration-300 ${dateFilter ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-50" : "border-slate-200 hover:border-blue-400"
                  }`}>
                  <span className="text-blue-500 text-lg shrink-0">📅</span>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest leading-none mb-1">LEAVE ON</p>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-transparent border-none text-[11px] font-black text-slate-700 focus:outline-none cursor-pointer"
                    />
                  </div>
                  {dateFilter && (
                    <button onClick={() => setDateFilter("")} className="text-slate-400 hover:text-rose-500 transition-colors shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* FILTERS UI (Guest House) */}
            {activeTab === "guesthouse" && (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white px-4 py-2 rounded-[2.5rem] border-2 border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 px-4 group">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest group-hover:text-indigo-600">Arrival:</span>
                  <input
                    type="date"
                    value={arrivalFilter}
                    onChange={(e) => setArrivalFilter(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="hidden sm:block h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2 px-4 group">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest group-hover:text-indigo-600">Departure:</span>
                  <input
                    type="date"
                    value={departureFilter}
                    onChange={(e) => setDepartureFilter(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="hidden sm:block h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2 pl-4 pr-1">
                  <span className="text-[11px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-100">Booking On:</span>
                  <input
                    type="date"
                    value={bookingOnFilter}
                    onChange={(e) => setBookingOnFilter(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 cursor-pointer w-32"
                  />
                  {bookingOnFilter && (
                    <button onClick={() => setBookingOnFilter("")} className="text-slate-400 hover:text-rose-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium animate-pulse">Synchronizing applications...</p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* LEAVING TAB */}
              {activeTab === "leaving" && (
                filteredLeaving.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">No leaving forms match the selection.</p>
                  </div>
                ) : (
                  filteredLeaving.map(form => (
                    <div
                      key={form._id}
                      onClick={() => setSelectedHistory({
                        name: form.applicantName || form.studentId?.name || "Unknown",
                        entryNo: form.applicantEntryNo || form.studentId?.entryNumber || "N/A",
                        type: 'leaving'
                      })}
                      className="bg-white rounded-3xl px-8 py-6 border-2 border-slate-100 shadow-sm relative overflow-hidden hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 cursor-pointer group scale-[0.99] hover:scale-[1.01]"
                    >
                      <div className={`absolute left-0 top-0 h-full w-2 rounded-l-3xl shadow-lg ${form.status === 'Approved' ? 'bg-emerald-500' : form.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'
                        }`} />

                      <div className="pl-4">
                        {/* Top row: Name + date chips */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                          <p className="text-base font-semibold text-slate-500">
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest mr-2">Name:</span>
                            <span className="text-lg font-bold text-slate-800">{form.applicantName || form.studentId?.name || "Unknown"}</span>
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-[12px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg">
                              Leaving: <strong>{new Date(form.leavingDate).toLocaleDateString()}</strong>
                            </span>
                            <span className="text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg">
                              Returning: <strong>{new Date(form.returnDate).toLocaleDateString()}</strong>
                            </span>
                            {form.duration && (
                              <span className="text-[12px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg">
                                Duration {form.duration} days
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Combined info row: Entry, Branch, Reason */}
                        <p className="text-sm text-slate-600">
                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest mr-2">Entry Number:</span>
                          <span className="font-bold font-mono text-slate-800">{form.applicantEntryNo || form.studentId?.entryNumber || "N/A"}</span>

                          {form.applicantDepartment && (
                            <>
                              <span className="mx-2 text-slate-300">|</span>
                              <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest mr-2">Branch:</span>
                              <span className="font-semibold text-slate-800">{form.applicantDepartment}</span>
                            </>
                          )}

                          <span className="mx-2 text-slate-300">|</span>
                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest mr-2">Reason:</span>
                          <span className="text-slate-700">{form.reason}</span>
                        </p>
                      </div>
                    </div>

                  ))
                )
              )}

              {/* GUEST HOUSE TAB */}
              {activeTab === "guesthouse" && (
                filteredGuest.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">No guest house bookings found.</p>
                  </div>
                ) : (
                  filteredGuest.map(form => (
                    <div
                      key={form._id}
                      onClick={() => setSelectedHistory({
                        name: form.applicantName || form.studentId?.name || "Unknown",
                        entryNo: form.applicantEntryNo || form.studentId?.entryNumber || "N/A",
                        type: 'guest'
                      })}
                      className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 justify-between relative overflow-hidden group hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 cursor-pointer scale-[0.99] hover:scale-[1.01]"
                    >
                      <div className="absolute left-0 top-0 h-full w-2 bg-indigo-500 shadow-lg" />

                      <div className="flex-1 pl-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md tracking-widest">Guest House Detail</span>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mt-2">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Applicant</p>
                            <p className="font-bold text-slate-800 text-sm">{form.applicantName || form.studentId?.name || "Unknown"}</p>
                            <p className="text-xs text-slate-500">{form.applicantEntryNo || form.studentId?.entryNumber || "N/A"}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black">{form.applicantDepartment || ''}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Guest Info</p>
                            <p className="font-bold text-slate-800 text-sm">{form.guestName}</p>
                            <p className="text-xs text-slate-500">{form.contactNumber}</p>
                            {form.paymentByGuest && <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-w-fit mt-1 w-fit">Pays directly</p>}
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Booking</p>
                            <p className="font-bold text-slate-800 text-sm">{form.roomToBeBooked || form.roomType}</p>
                            <p className="text-xs text-slate-500">{form.numGuests} guests, {form.numRooms} rooms</p>
                            {form.occupancyType && <p className="text-[10px] text-slate-500 mt-1 italic">{form.occupancyType}</p>}
                          </div>

                          <div className="space-y-1 border-l-0 lg:border-l-2 border-slate-100 lg:pl-6">
                            <div className="flex gap-4">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400">Check-In</p>
                                <p className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{new Date(form.arrivalDate).toLocaleDateString()} {form.arrivalTime || ''}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400">Check-Out</p>
                                <p className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{new Date(form.departureDate).toLocaleDateString()} {form.departureTime || ''}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

            </div>
          )}
        </div>
      </div>

      {/* HISTORY MODAL overlay */}
      {selectedHistory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Application History</p>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedHistory.name}</h2>
                <p className="text-xs font-bold text-slate-400 font-mono mt-0.5">{selectedHistory.entryNo}</p>
              </div>
              <button
                onClick={() => setSelectedHistory(null)}
                className="bg-white p-3 rounded-full border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-md transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase text-slate-500 tracking-wider">
                  Past {selectedHistory.type === 'leaving' ? 'Leaves' : 'Bookings'}
                </h3>
                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-blue-100">
                  {getStudentHistory().length} total
                </span>
              </div>

              <div className="space-y-3">
                {getStudentHistory().map((hist, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-3xl border-2 border-slate-50 hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-300 group shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:text-blue-600 group-hover:bg-white group-hover:border-blue-100 transition-all shadow-inner">
                        #{getStudentHistory().length - idx}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-black text-slate-800 tracking-tight">
                            {selectedHistory.type === 'leaving'
                              ? `${new Date(hist.leavingDate).toLocaleDateString()} → ${new Date(hist.returnDate).toLocaleDateString()}`
                              : `${new Date(hist.arrivalDate).toLocaleDateString()} → ${new Date(hist.departureDate).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 italic flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          {selectedHistory.type === 'leaving' ? hist.reason : hist.roomToBeBooked || hist.roomType}
                        </p>
                      </div>
                    </div>
                    {hist.duration && (
                      <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shrink-0 shadow-sm">
                        {hist.duration} {selectedHistory.type === 'leaving' ? 'days' : 'guests'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Close to return to dashboard</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
