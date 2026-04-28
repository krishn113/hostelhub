"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { Users, AlertCircle, Home, CheckCircle2, Navigation, MessageSquare, Megaphone, FileText } from "lucide-react";

export default function WardenOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [complaintStats, setComplaintStats] = useState({ active: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [studentRes, complaintsRes] = await Promise.all([
          API.get("/caretaker/students"),
          API.get("/complaints/caretaker") 
        ]);

        if (studentRes.data) {
          setStudents(studentRes.data.students || studentRes.data);
        }

        if (complaintsRes.data) {
          const complaintsList = Array.isArray(complaintsRes.data.complaints) 
            ? complaintsRes.data.complaints 
            : [];
          
          let active = 0;
          let resolved = 0;
          
          complaintsList.forEach(c => {
             if (c.status === "Resolved" || c.status === "Rejected") resolved++;
             else active++;
          });

          setComplaintStats({
             active, resolved, total: complaintsList.length
          });
        }
      } catch (err) {
        console.error("Failed to fetch overview data", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if warden context is available
    if (user?.role === "warden") {
       fetchOverviewData();
    }
  }, [user]);

  const assignedCount = students.filter(s => s.roomNumber).length;
  const unassignedCount = students.filter(s => !s.roomNumber).length;

  return (
    <DashboardLayout role="warden" activeTab="overview">
      <div className="p-4 md:p-8 min-h-screen" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}>
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#001D4C] tracking-tight mb-2">Hostel Overview</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Live metrics and rapid navigation</p>
        </header>

        {loading ? (
             <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#001D4C]"></div>
             </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h3 className="text-4xl font-black text-slate-800">{students.length}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Residents</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Home size={24} />
                </div>
                <h3 className="text-4xl font-black text-slate-800">{assignedCount}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rooms Allocated</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col items-center text-center group cursor-pointer" onClick={() => router.push("/dashboard/warden/complaints")}>
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-4xl font-black text-slate-800">{complaintStats.active}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Complaints</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col items-center text-center group cursor-pointer" onClick={() => router.push("/dashboard/warden/complaints")}>
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-4xl font-black text-slate-800">{complaintStats.resolved}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resolved Issues</p>
              </div>
            </div>

            {/* Warning Panel for Unassigned Students */}
            {unassignedCount > 0 && (
              <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-[2.5rem] mb-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-rose-800 text-lg uppercase tracking-tight">Allocation Pending</h3>
                    <p className="text-rose-600 font-bold text-sm">There are {unassignedCount} students waiting for room assignment.</p>
                  </div>
                </div>
                <button onClick={() => router.push("/dashboard/warden/students")} className="bg-white text-rose-600 font-black uppercase text-xs px-4 py-2 rounded-xl shadow-sm border border-rose-100 hover:bg-rose-100 transition-colors">
                  View Students
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <h2 className="text-xl font-black text-[#001D4C] uppercase tracking-tight mb-6 flex items-center gap-2">
                 <Navigation size={20} /> Quick Navigation
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => router.push("/dashboard/warden/students")} className="p-6 rounded-3xl bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-1">
                     <Users size={28} className="text-indigo-600" />
                     <span className="font-bold text-indigo-900">Student List</span>
                  </button>
                  <button onClick={() => router.push("/dashboard/warden/complaints")} className="p-6 rounded-3xl bg-amber-50 border border-transparent hover:border-amber-200 transition-all flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-1">
                     <MessageSquare size={28} className="text-amber-600" />
                     <span className="font-bold text-amber-900">Track Complaints</span>
                  </button>
                  <button onClick={() => router.push("/dashboard/warden/notices")} className="p-6 rounded-3xl bg-rose-50 border border-transparent hover:border-rose-200 transition-all flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-1">
                     <Megaphone size={28} className="text-rose-600" />
                     <span className="font-bold text-rose-900">Manage Notices</span>
                  </button>
                  <button onClick={() => router.push("/dashboard/warden/forms")} className="p-6 rounded-3xl bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-1">
                     <FileText size={28} className="text-emerald-600" />
                     <span className="font-bold text-emerald-900">Hostel Forms</span>
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
