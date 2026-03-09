import React from "react";

export default function HostelLeavingModal({ 
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
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hostel Leaving</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Application Form</p>
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
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g., +91 9876543210"
                    value={form.applicantMobileNo}
                    onChange={(e) => setForm({ ...form, applicantMobileNo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">2. Leave Details</h3>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Reason for Leaving</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Going home for holidays"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-bold text-slate-700 border-b border-slate-100 pb-2">3. Parent/Guardian Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Name of Parents/Guardians</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500 text-slate-700"
                  placeholder="Parent or Guardian Name"
                  value={form.nameOfParents}
                  onChange={(e) => setForm({ ...form, nameOfParents: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Contact of Parents/Guardians</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500 text-slate-700"
                  placeholder="Contact Number"
                  value={form.contactOfParents}
                  onChange={(e) => setForm({ ...form, contactOfParents: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Address During Leave</label>
              <textarea
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500 resize-none h-24"
                placeholder="Full address where you'll be staying"
                value={form.addressDuringLeave}
                onChange={(e) => setForm({ ...form, addressDuringLeave: e.target.value })}
              />
            </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Leaving Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500 text-slate-700"
                  value={form.leavingDate}
                  onChange={(e) => setForm({ ...form, leavingDate: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Return Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-blue-500 text-slate-700"
                  value={form.returnDate}
                  onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
