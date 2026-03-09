"use client";

import { useState, useEffect } from "react";

export default function WardenForms() {
  const [guestForms, setGuestForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const guessRes = await fetch("http://localhost:5000/api/warden/forms/guesthouse", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (guessRes.ok) {
        const data = await guessRes.json();
        setGuestForms(data);
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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black text-slate-800 tracking-tight">Guest House Bookings</h1>
      
      {loading ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-medium italic">
          Loading bookings...
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {guestForms.length === 0 ? (
              <div className="p-20 text-center text-slate-400 font-medium italic">No guest house bookings found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="p-6">Applicant</th>
                    <th className="p-6">Guest Name (Contact)</th>
                    <th className="p-6">Details</th>
                    <th className="p-6">Dates</th>
                    <th className="p-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {guestForms.map(form => (
                    <tr key={form._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <div className="font-bold text-slate-800">{form.applicantName || form.studentId?.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500 font-medium">{form.applicantEntryNo || form.studentId?.entryNumber || "N/A"}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-bold">{form.applicantDepartment || ''}</div>
                      </td>
                      <td className="p-6 text-sm">
                        <div className="font-bold text-slate-800">{form.guestName}</div>
                        <div className="text-xs text-slate-500 font-medium">{form.contactNumber}</div>
                        {form.paymentByGuest && <div className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-2">Payment via Guest</div>}
                      </td>
                      <td className="p-6 text-sm text-slate-600">
                        <div className="font-bold text-slate-700">{form.roomToBeBooked || form.roomType}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{form.numGuests} guests, {form.numRooms} room(s)</div>
                        {form.occupancyType && <div className="text-[10px] text-slate-400 italic mt-1 font-medium">{form.occupancyType}</div>}
                      </td>
                      <td className="p-6 text-xs text-slate-600">
                        <div className="mb-1"><span className="text-slate-400 font-bold mr-1">IN:</span> <span className="font-black text-slate-700">{new Date(form.arrivalDate).toLocaleDateString()}</span> <span className="text-xs text-slate-400 ml-1">{form.arrivalTime || ''}</span></div>
                        <div><span className="text-slate-400 font-bold mr-1">OUT:</span> <span className="font-black text-slate-700">{new Date(form.departureDate).toLocaleDateString()}</span> <span className="text-xs text-slate-400 ml-1">{form.departureTime || ''}</span></div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${form.status === 'Approved' ? 'bg-emerald-500 text-white' : form.status === 'Rejected' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'}`}>
                          {form.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
