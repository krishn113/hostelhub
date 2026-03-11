"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import axios from "axios";
import api from "@/lib/api";
import Link from "next/link";
import NoticeForm from "@/components/NoticeForm";

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function WardenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For Modal
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [stats, setStats] = useState({ 
    newComplaints: 0, 
    resolvedComplaints: 0, 
    activeNotices: 0, 
    totalStudents: 0 
  });
  const [WardenInfo, setWardenInfo] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/auth/me');
      setWardenInfo(userRes.data);

      const [noticesRes, studentsRes, complaintsRes] = await Promise.all([
        api.get('/notices'),
        api.get('/caretaker/students'),
        api.get('/complaints')
      ]);

      const notices = noticesRes.data || [];
      const studentsData = studentsRes.data.students || studentsRes.data || [];
      const complaintsData = complaintsRes.data || [];

      setStats({
        newComplaints: complaintsData.filter(c => c.status === 'Pending').length,
        resolvedComplaints: complaintsData.filter(c => c.status === 'Resolved').length,
        activeNotices: notices.length,
        totalStudents: studentsData.length || 0
      });

      setComplaints(
        complaintsData
          .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0,5)
      );
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Pending', value: stats.newComplaints || 0, color: '#f97316' },
    { name: 'Resolved', value: stats.resolvedComplaints || 0, color: '#10b981' }
  ];

  const barData = [
    { name: 'Resolved', count: stats.resolvedComplaints || 0 },
    { name: 'Pending', count: stats.newComplaints || 0 },
    { name: 'Notices', count: stats.activeNotices || 0 }
  ];

  const getRowColor = (category) => {
    switch(category) {
      case 'Urgent': return 'bg-rose-50/50';
      case 'Academic': return 'bg-indigo-50/50';
      case 'Maintenance': return 'bg-amber-50/50';
      case 'Events': return 'bg-emerald-50/50';
      default: return 'hover:bg-slate-50/50';
    }
  };

 return (
    <DashboardLayout role="warden">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Warden Dashboard
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Management hub for {WardenInfo?.hostelName || 'your hostel'}
          </p>
        </div>
        
        <div className="flex gap-4">
           <button 
            onClick={() => setIsNoticeModalOpen(true)} 
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 group"
          >
            Post Global Notice
          </button>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="p-3.5 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition-all shadow-sm group"
          >
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition">
              {WardenInfo?.name?.charAt(0) || 'W'}
            </div>
          </button>
        </div>
      </div>

      <StatsGrid stats={[
        { label: "Pending Issues", value: (stats.newComplaints || 0).toString(), colorClass: "bg-orange-50/50 text-orange-700 border border-orange-200 cursor-pointer hover:bg-orange-100/50", onClick: () => window.location.href = "/dashboard/warden/complaints" },
        { label: "Resolved", value: (stats.resolvedComplaints || 0).toString(), colorClass: "bg-emerald-50/50 text-emerald-700 border border-emerald-200" },
        { 
          label: "Active Notices", 
          value: (stats.activeNotices || 0).toString(), 
          colorClass: "bg-blue-50/50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100/50 transition",
          onClick: () => window.location.href = "/dashboard/warden/notices" 
        },
        { label: "Total Residents", value: (stats.totalStudents || 0).toString(), colorClass: "bg-indigo-50/50 text-indigo-700 border border-indigo-200 cursor-pointer hover:bg-indigo-100/50", onClick: () => window.location.href = "/dashboard/warden/students" },
      ]} />

      {/* ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 mb-10">
        {/* COMPLAINT STATUS DONUT */}
        <div className="bg-purple-100 backdrop-blur-md p-8 rounded-[3rem] shadow-xl shadow-purple-200/30 border border-purple-200/50 group transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-sm font-black text-purple-700 uppercase tracking-widest">Issue Resolution</h3>
            <span className="text-[10px] font-black text-purple-600 bg-white px-4 py-1.5 rounded-full shadow-sm border border-purple-100 uppercase tracking-tighter italic">Live Stats</span>
          </div>
          <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', color: '#7e22ce', letterSpacing: '0.1em' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RESOURCE ACTIVITY BAR */}
        <div className="bg-purple-100 backdrop-blur-md p-8 rounded-[3rem] shadow-xl shadow-purple-200/30 border border-purple-200/50 group transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-sm font-black text-purple-700 uppercase tracking-widest">Overview Activity</h3>
            <span className="text-[10px] font-black text-purple-600 bg-white px-4 py-1.5 rounded-full shadow-sm border border-purple-100 uppercase tracking-tighter">Summary</span>
          </div>
          <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d8b4fe" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#7e22ce' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#7e22ce' }} />
                <Tooltip cursor={{ fill: '#f3e8ff' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT COMPLAINTS TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Active Complaints</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Student</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Issue</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Room</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {complaints.map((row) => (
                <tr key={row._id} className={`group transition-colors ${getRowColor(row.category)}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100">
                        {row.studentName?.charAt(0) || 'S'}
                      </div>
                      <span className="font-bold text-slate-700">{row.studentName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{row.category}</span>
                      <span className="text-xs text-slate-500 font-medium truncate max-w-xs">{row.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{row.student?.roomNumber || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Global Notice Form */}
      <NoticeForm 
        isOpen={isNoticeModalOpen} 
        onClose={() => setIsNoticeModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />

      {/* Warden Profile Modal */}
      {isProfileModalOpen && WardenInfo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 scale-in-center">
            <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700"></div>
               <div className="relative z-10">
                 <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-black text-indigo-600 shadow-xl border-4 border-indigo-100 mb-3">
                   {WardenInfo.name?.charAt(0) || 'C'}
                 </div>
                 <h2 className="text-2xl font-black text-white leading-tight">{WardenInfo.name}</h2>
                 <p className="text-indigo-100 text-sm font-medium mt-1">Official Warden</p>
               </div>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Assigned Hostel</p>
                  <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                    <span>🏠 {WardenInfo.hostelName || 'Unassigned'}</span>
                    {WardenInfo.hostelType && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md">
                        {WardenInfo.hostelType} Hostel
                      </span>
                    )}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Email Address</p>
                  <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    ✉️ {WardenInfo.email}
                  </p>
               </div>
               {WardenInfo.phone && (
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Phone Number</p>
                    <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                      📞 {WardenInfo.phone}
                    </p>
                 </div>
               )}
               <button 
                 onClick={() => setIsProfileModalOpen(false)}
                 className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition"
               >
                 Close Profile
               </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}