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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Guest House Bookings</h1>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500 italic">Loading bookings...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {guestForms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No guest house bookings found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                    <th className="p-4 font-semibold text-gray-700">Applicant</th>
                    <th className="p-4 font-semibold text-gray-700">Guest Name (Contact)</th>
                    <th className="p-4 font-semibold text-gray-700">Details</th>
                    <th className="p-4 font-semibold text-gray-700">Dates</th>
                    <th className="p-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {guestForms.map(form => (
                    <tr key={form._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{form.studentId?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{form.studentId?.entryNumber || "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-800">{form.guestName}</div>
                        <div className="text-xs text-gray-500">{form.contactNumber}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div>{form.roomType}</div>
                        <div className="text-xs text-gray-500">{form.numGuests} guests, {form.numRooms} room(s)</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div><span className="text-gray-400">In:</span> {new Date(form.arrivalDate).toLocaleDateString()}</div>
                        <div><span className="text-gray-400">Out:</span> {new Date(form.departureDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${form.status === 'Approved' ? 'bg-green-100 text-green-700' : form.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
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
