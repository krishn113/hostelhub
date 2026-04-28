"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Building2, Calendar, Clock, User, Phone, CreditCard } from "lucide-react";
import { Search } from "lucide-react";

export default function WardenForms() {
  const [guestForms, setGuestForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");

  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      const guessRes = await fetch(`${apiUrl}/warden/forms/guesthouse`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (guessRes.ok) {
        const data = await guessRes.json();
        // Sort guest forms by arrival date (newest first)
        const sortedData = [...data].sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
        setGuestForms(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch warden forms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500 text-white';
      case 'Rejected': return 'bg-rose-500 text-white';
      default: return 'bg-amber-400 text-white';
    }
  };

  // Filter Logic
  const filteredForms = guestForms.filter((form) => {
    const query = search.toLowerCase();

    return (
      form.guestName?.toLowerCase().includes(query) ||
      form.applicantName?.toLowerCase().includes(query) ||
      form.studentId?.name?.toLowerCase().includes(query) ||
      form.applicantEntryNo?.toLowerCase().includes(query) ||
      form.studentId?.entryNumber?.toLowerCase().includes(query) ||
      form.contactNumber?.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout role="warden" activeTab="forms">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <header className="mb-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">Guest House Bookings</h1>
              <p className="text-slate-500 font-medium italic">View and monitor guest house applications across the hostel.</p>
            </div>
            
            <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Records</p>
              <p className="text-2xl font-black text-indigo-600">{filteredForms.length}</p>
            </div>
          </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm w-full md:w-96">
          <div className="flex items-center gap-3 px-4">
            
            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search guest, applicant, entry no, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-rose-500 text-sm font-bold"
              >
                ✕
              </button>
            )}

          </div>
        </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium animate-pulse">Synchronizing records...</p>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">No guest house bookings found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredForms.map(form => (
                <div key={form._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8 relative overflow-hidden group hover:border-indigo-200 transition-all">
                  <div className="absolute left-0 top-0 h-full w-2 bg-indigo-500" />
                  
                  <div className="flex-1 space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Guest House Detail</span>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                          {form.guestName}
                        </h3>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {/* Applicant Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          <User size={12} />
                          <span>Applicant</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{form.applicantName || form.studentId?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500 font-medium">{form.applicantEntryNo || form.studentId?.entryNumber || "N/A"}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black mt-1 italic">{form.applicantDepartment || ''}</p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          <Phone size={12} />
                          <span>Guest Contact</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{form.contactNumber}</p>
                          {form.paymentByGuest && (
                            <div className="flex items-center gap-1.5 mt-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                              <CreditCard size={10} />
                              <span>Self Payment</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          <Building2 size={12} />
                          <span>Accommodation</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{form.roomToBeBooked || form.roomType}</p>
                          <p className="text-xs text-slate-500 font-medium">{form.numGuests} guests, {form.numRooms} rooms</p>
                          {form.occupancyType && <p className="text-[10px] text-slate-400 italic mt-1 font-medium">{form.occupancyType}</p>}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 border-l-0 lg:border-l border-slate-100 lg:pl-8">
                        <div className="flex flex-col gap-3">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Check-In</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg w-fit">
                              <Calendar size={12} className="text-slate-400" />
                              {new Date(form.arrivalDate).toLocaleDateString()}
                              <span className="text-xs font-medium text-slate-400 ml-1">{form.arrivalTime || ''}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Check-Out</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg w-fit">
                              <Clock size={12} className="text-slate-400" />
                              {new Date(form.departureDate).toLocaleDateString()}
                              <span className="text-xs font-medium text-slate-400 ml-1">{form.departureTime || ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purpose Footer */}
                    {form.purpose && (
                      <div className="pt-4 border-t border-slate-50">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Purpose of visit</p>
                        <p className="text-sm text-slate-600 font-medium italic">"{form.purpose}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}