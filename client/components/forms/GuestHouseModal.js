import React from "react";

export default function GuestHouseModal({ 
  isOpen, 
  onClose, 
  form, 
  setForm, 
  onSubmit 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Guest House</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Booking Form</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto">
          <form onSubmit={onSubmit} className="space-y-8">
            
            {/* Applicant Info Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">1. Applicant Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Applicant Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your name"
                    value={form.applicantName}
                    onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Department</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g., Computer Science"
                    value={form.applicantDepartment}
                    onChange={(e) => setForm({ ...form, applicantDepartment: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Entry Number</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g., 2021CSB1001"
                    value={form.applicantEntryNo}
                    onChange={(e) => setForm({ ...form, applicantEntryNo: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g., +91 9876543210"
                    value={form.applicantMobileNo}
                    onChange={(e) => setForm({ ...form, applicantMobileNo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Guest Info Section */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">2. Guest Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Primary Guest Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter full name"
                    value={form.guestName}
                    onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Gender</label>
                  <select
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 appearance-none"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Address</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter complete residential address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Contact Number</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., +91 9876543210"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Room Info Section */}
            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">3. Booking Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Room Category</label>
                  <select
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 appearance-none"
                    value={form.roomToBeBooked}
                    onChange={(e) => setForm({ ...form, roomToBeBooked: e.target.value })}
                  >
                    <option value="">Choose Category</option>
                    <optgroup label="Executive Suite">
                      <option value="Executive Suite - Cat-A (Free)">Cat-A (Free)</option>
                      <option value="Executive Suite - Cat-B (Rs. 3500/-)">Cat-B (Rs. 3500/-)</option>
                    </optgroup>
                    <optgroup label="Business Rooms">
                      <option value="Business Room - Cat-A (Free)">Cat-A (Free)</option>
                      <option value="Business Room - B-1 (Rs. 2000/-)">B-1 (Rs. 2000/-)</option>
                      <option value="Business Room - B-2 (Rs. 1200/-)">B-2 (Rs. 1200/-)</option>
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Total Guests</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g., 2"
                    value={form.numGuests}
                    onChange={(e) => setForm({ ...form, numGuests: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Rooms Required</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g., 1"
                    value={form.numRooms}
                    onChange={(e) => setForm({ ...form, numRooms: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Occupancy Format</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 1 single room, 1 double room"
                  value={form.occupancyType}
                  onChange={(e) => setForm({ ...form, occupancyType: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Arrival Check-In</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className="w-2/3 bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      value={form.arrivalDate}
                      onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
                    />
                    <input
                      type="time"
                      required
                      className="w-1/3 bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      value={form.arrivalTime}
                      onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Departure Check-Out</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className="w-2/3 bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      value={form.departureDate}
                      onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                    />
                    <input
                      type="time"
                      required
                      className="w-1/3 bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      value={form.departureTime}
                      onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Purpose of Visit</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                  placeholder="E.g., Attending convocation, Parents visit"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                <input
                  type="checkbox"
                  id="paymentByGuest"
                  checked={form.paymentByGuest}
                  onChange={(e) => setForm({ ...form, paymentByGuest: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="paymentByGuest" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Payment will be made directly by the guest
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              >
                Submit Room Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
