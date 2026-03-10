"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function WardenForms() {
  const [guestForms, setGuestForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const guessRes = await fetch(
        "http://localhost:5000/api/warden/forms/guesthouse",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    <DashboardLayout role="warden">
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Guest House Bookings
          </h1>
          <p className="text-slate-500 text-sm">
            Review guest house accommodation requests submitted by students.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 italic">
            Loading bookings...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              {guestForms.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No guest house bookings found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                      <th className="p-4 font-semibold text-slate-700">Applicant</th>
                      <th className="p-4 font-semibold text-slate-700">Guest</th>
                      <th className="p-4 font-semibold text-slate-700">Details</th>
                      <th className="p-4 font-semibold text-slate-700">Dates</th>
                      <th className="p-4 font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {guestForms.map((form) => (
                      <tr
                        key={form._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">
                            {form.studentId?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {form.studentId?.entryNumber || "N/A"}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="text-sm font-semibold text-slate-800">
                            {form.guestName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {form.contactNumber}
                          </div>
                        </td>

                        <td className="p-4 text-sm text-slate-600">
                          <div>{form.roomType}</div>
                          <div className="text-xs text-slate-500">
                            {form.numGuests} guests • {form.numRooms} room(s)
                          </div>
                        </td>

                        <td className="p-4 text-sm text-slate-600">
                          <div>
                            <span className="text-slate-400">In:</span>{" "}
                            {new Date(form.arrivalDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-slate-400">Out:</span>{" "}
                            {new Date(form.departureDate).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              form.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : form.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
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
    </DashboardLayout>
  );
}