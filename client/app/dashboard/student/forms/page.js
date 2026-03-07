"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import HostelLeavingModal from "@/components/forms/HostelLeavingModal";
import GuestHouseModal from "@/components/forms/GuestHouseModal";
import { DoorOpen, Building2, History, Info } from "lucide-react";

export default function StudentForms() {
  const [leaveForm, setLeaveForm] = useState({ reason: "", leavingDate: "", returnDate: "" });
  const [guestForm, setGuestForm] = useState({ guestName: "", gender: "", address: "", contactNumber: "", numGuests: "", numRooms: "", roomType: "", arrivalDate: "", departureDate: "", purpose: "" });

  const [myForms, setMyForms] = useState({ leavingForms: [], guestHouseForms: [] });
  const [loading, setLoading] = useState(true);

  // Modal Toggles
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const fetchMyForms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/student/forms", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyForms(data);
      }
    } catch (error) {
      console.error("Failed to fetch forms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyForms();
  }, []);

  const submitLeaveForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/student/hostel-leaving/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(leaveForm)
    });

    if (res.ok) {
      alert("Leave request submitted successfully.");
      setLeaveForm({ reason: "", leavingDate: "", returnDate: "" });
      setShowLeaveModal(false);
      fetchMyForms();
    } else {
      alert("Failed to submit leave request");
    }
  };

  const submitGuestForm = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/student/guesthouse/book", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(guestForm)
    });

    if (res.ok) {
      alert("Guest house request submitted successfully.");
      setGuestForm({ guestName: "", gender: "", address: "", contactNumber: "", numGuests: "", numRooms: "", roomType: "", arrivalDate: "", departureDate: "", purpose: "" });
      setShowGuestModal(false);
      fetchMyForms();
    } else {
      alert("Failed to submit guesthouse request");
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-500 text-white';
      case 'Rejected': return 'bg-rose-500 text-white';
      default: return 'bg-amber-400 text-white';
    }
  };

  return (
    <DashboardLayout role="student" activeTab="forms">
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Applications & Forms</h1>
            <p className="text-slate-500 font-medium mt-2">Manage your leave and guest house requests</p>
          </div>
        </div>

        {/* Action Cards (Triggers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="group relative bg-white p-8 rounded-[3rem] border-2 border-slate-100 hover:border-blue-300 transition-all text-left overflow-hidden shadow-sm hover:shadow-xl"
          >
            <div className="absolute -right-12 -top-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <DoorOpen size={180} />
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl h-fit w-fit mb-6">
              <DoorOpen size={32}/>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Hostel Leaving Form</h2>
            <p className="text-slate-500 font-medium">Apply for temporary leave or holiday vacations.</p>
            <div className="mt-8 text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
              Apply Now &rarr;
            </div>
          </button>

          <button 
            onClick={() => setShowGuestModal(true)}
            className="group relative bg-white p-8 rounded-[3rem] border-2 border-slate-100 hover:border-indigo-300 transition-all text-left overflow-hidden shadow-sm hover:shadow-xl"
          >
            <div className="absolute -right-12 -top-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building2 size={180} />
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl h-fit w-fit mb-6">
              <Building2 size={32}/>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Guest House Booking</h2>
            <p className="text-slate-500 font-medium">Reserve rooms for parents or official guests.</p>
            <div className="mt-8 text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-2">
              Book Room &rarr;
            </div>
          </button>

        </div>

        {/* FEED: RENDERING HISTORY */}
        <div className="pt-8">
          <div className="flex items-center gap-3 mb-8">
            <History size={24} className="text-slate-400" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Submissions</h2>
          </div>

          <div className="grid gap-8">
            {loading ? (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Loading history...</p>
              </div>
            ) : myForms.leavingForms.length === 0 && myForms.guestHouseForms.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No forms submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Leaving Forms */}
                {myForms.leavingForms.map((form) => (
                  <div key={form._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:border-blue-100 transition-all">
                    <div className={`absolute top-6 right-8 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusStyles(form.status)}`}>
                      {form.status}
                    </div>
                    
                    <div className="flex gap-5">
                      <div className="p-4 bg-blue-50 text-blue-500 rounded-3xl h-fit"><DoorOpen size={24}/></div>
                      <div className="space-y-1 w-full">
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leaving Request</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{form.reason}</h3>
                        <div className="pt-4 flex items-center gap-6 mt-2 border-t border-slate-50 text-sm font-medium text-slate-500">
                           <p>Leaving: <span className="text-slate-800 font-bold">{new Date(form.leavingDate).toLocaleDateString()}</span></p>
                           <p>Returning: <span className="text-slate-800 font-bold">{new Date(form.returnDate).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Guest Forms */}
                {myForms.guestHouseForms.map((form) => (
                  <div key={form._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:border-indigo-100 transition-all">
                    <div className={`absolute top-6 right-8 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusStyles(form.status)}`}>
                      {form.status}
                    </div>
                    
                    <div className="flex gap-5">
                      <div className="p-4 bg-indigo-50 text-indigo-500 rounded-3xl h-fit"><Building2 size={24}/></div>
                      <div className="space-y-1 w-full">
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest House Booking</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{form.guestName} <span className="text-sm text-slate-400 font-medium tracking-normal ml-2">({form.purpose})</span></h3>
                        
                        <div className="pt-4 flex items-center gap-6 mt-2 border-t border-slate-50 text-sm font-medium text-slate-500">
                           <p>Type: <span className="text-slate-800 font-bold">{form.roomType}</span></p>
                           <p>Guests: <span className="text-slate-800 font-bold">{form.numGuests}</span></p>
                           <p>Rooms: <span className="text-slate-800 font-bold">{form.numRooms}</span></p>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-medium text-slate-500 mt-2">
                           <p>Check-In: <span className="text-slate-800 font-bold">{new Date(form.arrivalDate).toLocaleDateString()}</span></p>
                           <p>Check-Out: <span className="text-slate-800 font-bold">{new Date(form.departureDate).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <HostelLeavingModal 
        isOpen={showLeaveModal} 
        onClose={() => setShowLeaveModal(false)} 
        form={leaveForm} 
        setForm={setLeaveForm} 
        onSubmit={submitLeaveForm} 
      />
      
      <GuestHouseModal 
        isOpen={showGuestModal} 
        onClose={() => setShowGuestModal(false)}  
        form={guestForm} 
        setForm={setGuestForm} 
        onSubmit={submitGuestForm} 
      />

    </DashboardLayout>
  );
}