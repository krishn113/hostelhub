"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import API from "@/lib/api";
import { MessageSquare, Bell, FileText, ArrowUpRight } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [latestNotice, setLatestNotice] = useState(null);
  const [complaintStats, setComplaintStats] = useState({ pending: 0, resolved: 0 });

useEffect(() => {
  const fetchDashboardData = async () => {
    // Only fetch if the user profile from AuthContext is fully loaded
    if (!user?.year || !user?.gender || !user?.degreeType) return;

    try {
      const allocRes = await API.get("/allocations/find", {
        params: { 
          year: user.year, 
          gender: user.gender, 
          degreeType: user.degreeType 
        }
      });

      const hostelId = allocRes.data?.hostelId?._id || allocRes.data?.hostelId;

      const [noticeRes, complaintRes] = await Promise.all([
        hostelId ? API.get("/notices", { params: { hostel: hostelId } }) : Promise.resolve({ data: [] }),
        API.get("/complaints/my-complaints")
      ]);

      // Notices
      if (noticeRes.data.length > 0) {
        const sorted = noticeRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLatestNotice(sorted[0]); 
      }

      // Complaint Stats
      const myComplaints = complaintRes.data || [];
      setComplaintStats({
        pending: myComplaints.filter(c => c.status !== 'Resolved').length,
        resolved: myComplaints.filter(c => c.status === 'Resolved').length
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  fetchDashboardData();
}, [user, activeTab]);

  const chartData = [
    { name: 'Active', value: complaintStats.pending || 0, color: '#f97316' },
    { name: 'Resolved', value: complaintStats.resolved || 0, color: '#10b981' }
  ];

  if (!user) return <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">Loading Student Portal...</div>;

  return (
    <DashboardLayout role="student" activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-10">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {activeTab === 'overview' ? `Hey, ${user.name?.split(' ')[0]}! ` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            {activeTab === 'overview' ? `Welcome to your ${user.hostelName} ${user.hostelType || 'Hostel'} Dashboard` : `Manage your ${activeTab} requests here.`}
          </p>
        </div>
        
        {activeTab === "overview" && (
          <button 
            onClick={() => setActiveTab("complaints")} 
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 group"
          >
            <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
            Post New Complaint
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="animate-in fade-in zoom-in-95 duration-500">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <StatsGrid stats={[
              { label: "My Room", value: user.roomNumber || "Pending", colorClass: "bg-emerald-50/50 text-emerald-700 border border-emerald-200" },
              { label: "Active Issues", value: complaintStats.pending.toString(), colorClass: "bg-orange-50/50 text-orange-700 border border-orange-200" },
              { label: "New Notices", value: "2", colorClass: "bg-blue-50/50 text-blue-700 border border-blue-200" },
              { label: "Hostel Hub", value: user.hostelName || "N/A", colorClass: "bg-indigo-50/50 text-indigo-700 border border-indigo-200" },
            ]} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* 1. COMPLAINT CHART CARD (The Purplish Style) */}
               <div className="bg-purple-100 backdrop-blur-md p-8 rounded-[3rem] shadow-xl shadow-purple-200/30 border border-purple-200/50 group transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                 <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl" />
                 <div className="flex items-center justify-between mb-8 relative z-10">
                   <h3 className="text-sm font-black text-purple-500 uppercase tracking-widest">Issue Tracking</h3>
                   <span className="text-[10px] font-black text-purple-700 bg-white px-4 py-1.5 rounded-full shadow-sm border border-purple-100 uppercase tracking-tighter">My Stats</span>
                 </div>
                 <div className="h-[220px] w-full relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                       >
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#7e22ce' }}/>
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* 2. LATEST NOTICE CARD */}
               <div className="p-8 bg-white border border-blue-100 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Bell size={120} />
                  </div>
                  
                  <h3 className="font-black text-slate-800 text-xl mb-4 flex items-center gap-2">
                    {latestNotice ? "Latest Notice 📢" : "No Notices Yet"}
                  </h3>
                  
                  <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mb-6">
                    <p className="text-slate-700 font-bold text-sm leading-relaxed">
                      {latestNotice 
                        ? latestNotice.title 
                        : `Check back later for updates regarding the ${user.hostelName} community.`}
                    </p>
                  </div>
                  
                  <button 
                  onClick={() => setActiveTab('notices')}
                  className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  {latestNotice ? "Read More" : "View All"} <ArrowUpRight size={14} />
                </button>
               </div>

               {/* 3. TECHNICIAN VISIT / ANNOUNCEMENT (Pastel Tinted) */}
               <div className="p-8 bg-indigo-50/80 border border-indigo-100 rounded-[3.5rem] shadow-sm group relative overflow-hidden md:col-span-2">
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl" />
                  <h3 className="font-black text-indigo-700 text-xl mb-3 flex items-center gap-2 relative z-10">Technician Visit 🛠️</h3>
                  <p className="text-indigo-600/80 text-sm font-bold leading-relaxed relative z-10 max-w-2xl">
                    Great news! Your electrical issue in Room {user.roomNumber} has been acknowledged. The maintenance team will visit your room shortly.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                    <div className="bg-white px-5 py-2.5 rounded-2xl text-xs font-black text-indigo-700 shadow-sm border border-indigo-100 flex items-center gap-2">
                      <ArrowUpRight size={14} className="rotate-90" />
                      Arrival: Tomorrow, 10:30 AM
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* NOTICES TAB (VIEW ONLY) */}
        {activeTab === "notices" && (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-5">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 text-xl">📢</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Notice Title {i}</h4>
                  <p className="text-slate-500 text-sm mt-1">Detailed description of the hostel notice for {user.hostelName} students...</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">Posted on: Feb 17, 2026</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPLAINTS & FORMS PLACEHOLDERS */}
        {['complaints', 'forms'].includes(activeTab) && (
          <div className="py-24 text-center bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem]">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-slate-400 italic">Designing the {activeTab} interface...</h2>
            <p className="text-slate-300 text-sm">This module will follow the modular pastel theme.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}