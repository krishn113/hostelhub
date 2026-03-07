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

  const fetchForms = async () => {
    try {
      setLoading(true);
      const leavingRes = await API.get("/caretaker/forms/hostel-leaving");
      const guestRes = await API.get("/caretaker/forms/guesthouse");

      if (leavingRes.data) {
        setLeavingForms(leavingRes.data);
      }
      if (guestRes.data) {
        setGuestForms(guestRes.data);
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

  return (
    <DashboardLayout role="caretaker" activeTab="forms">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Student Forms</h1>
          <p className="text-slate-500 font-medium mb-6">Manage hostel leaving and guest house applications.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                  <DoorOpen size={24} />
                </span>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                  {leavingForms.length} TOTAL
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Leave Requests</h3>
            </div>
            
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                  <Building2 size={24} />
                </span>
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                  {guestForms.length} TOTAL
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Guest House</h3>
            </div>
          </div>
        </header>

        {/* MAIN FEED */}
        <div className="max-w-6xl mx-auto">
          
          {/* TABS */}
          <div className="flex space-x-2 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm mb-8 w-fit overflow-x-auto">
            <button 
              onClick={() => setActiveTab("leaving")}
              className={`py-2 px-6 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all ${
                activeTab === "leaving" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Hostel Leaving
            </button>
            <button 
              onClick={() => setActiveTab("guesthouse")}
              className={`py-2 px-6 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all ${
                activeTab === "guesthouse" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Guest House Bookings
            </button>
          </div>

          {loading ? (
             <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
               <p className="text-slate-400 font-medium">Loading applications...</p>
             </div>
          ) : (
            <div className="space-y-4">
              
              {/* LEAVING TAB */}
              {activeTab === "leaving" && (
                leavingForms.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">No leaving forms found.</p>
                  </div>
                ) : (
                  leavingForms.map(form => (
                    <div key={form._id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden group hover:border-blue-200 transition-all">
                      <div className={`absolute left-0 top-0 h-full w-1.5 ${
                        form.status === 'Approved' ? 'bg-green-500' : form.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'
                      }`} />
                      
                      <div className="flex-1 pl-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md tracking-widest">Hostel Leaving</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                             form.status === 'Approved' ? 'bg-green-50 text-green-600' : form.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                             {form.status}
                           </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{form.studentId?.name || "Unknown"} <span className="text-sm font-medium text-slate-500">({form.studentId?.entryNumber || "N/A"})</span></h3>
                        <p className="text-sm text-slate-600 truncate max-w-lg mb-2"><span className="font-semibold text-slate-700">Reason:</span> {form.reason}</p>
                        <div className="flex gap-6 mt-1 text-xs font-semibold text-slate-500">
                           <span className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Leaving: <span className="text-slate-800">{new Date(form.leavingDate).toLocaleDateString()}</span></span>
                           <span className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Returning: <span className="text-slate-800">{new Date(form.returnDate).toLocaleDateString()}</span></span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* GUEST HOUSE TAB */}
              {activeTab === "guesthouse" && (
                guestForms.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">No guest house bookings found.</p>
                  </div>
                ) : (
                  guestForms.map(form => (
                    <div key={form._id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between relative overflow-hidden group hover:border-indigo-200 transition-all">
                      <div className={`absolute left-0 top-0 h-full w-1.5 ${
                        form.status === 'Approved' ? 'bg-green-500' : form.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'
                      }`} />
                      
                      <div className="flex-1 pl-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md tracking-widest">Guest House</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                             form.status === 'Approved' ? 'bg-green-50 text-green-600' : form.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                             {form.status}
                           </span>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mt-2">
                           <div className="space-y-1">
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Applicant</p>
                             <p className="font-bold text-slate-800 text-sm">{form.studentId?.name || "Unknown"}</p>
                             <p className="text-xs text-slate-500">{form.studentId?.entryNumber || "N/A"}</p>
                           </div>

                           <div className="space-y-1">
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Guest Info</p>
                             <p className="font-bold text-slate-800 text-sm">{form.guestName}</p>
                             <p className="text-xs text-slate-500">{form.contactNumber}</p>
                           </div>

                           <div className="space-y-1">
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Booking</p>
                             <p className="font-bold text-slate-800 text-sm">{form.roomType}</p>
                             <p className="text-xs text-slate-500">{form.numGuests} guests, {form.numRooms} rooms</p>
                           </div>

                           <div className="space-y-1 border-l-0 lg:border-l-2 border-slate-100 lg:pl-6">
                              <div className="flex gap-4">
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-400">Check-In</p>
                                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{new Date(form.arrivalDate).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-400">Check-Out</p>
                                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{new Date(form.departureDate).toLocaleDateString()}</p>
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
    </DashboardLayout>
  );
}
