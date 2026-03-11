"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import axios from "axios";
import API from "@/lib/api";
import Link from "next/link";
import NoticeForm from "@/components/NoticeForm";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function CaretakerDashboard() {
  const isCaretaker = true;
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For Modal
  const [techDate, setTechDate] = useState("");
  const fileInputRef = useRef(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [stats, setStats] = useState({ 
    newComplaints: 0, 
    resolvedComplaints: 0, 
    activeNotices: 0, 
    totalStudents: 0 
  });
  const [caretakerInfo, setCaretakerInfo] = useState(null);

  // DATA FOR CHARTS
  const complaintData = [
    { name: 'Active', value: stats.newComplaints || 0, color: '#f97316' }, // orange-500
    { name: 'Resolved', value: stats.resolvedComplaints || 0, color: '#10b981' }, // emerald-500
  ];

  const resourceData = [
    { name: 'Students', value: stats.totalStudents || 0, color: '#6366f1' }, // indigo-500
    { name: 'Notices', value: stats.activeNotices || 0, color: '#3b82f6' }, // blue-500
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch User Info
      const userRes = await API.get('/auth/me');
      setCaretakerInfo(userRes.data);

      // Fetch Stats Parallel
      const [noticesRes, studentsRes, complaintsRes] = await Promise.all([
        API.get('/notices'),
        API.get('/caretaker/students'),
        API.get('/complaints')
      ]);

      const notices = noticesRes.data || [];
      const studentsData = studentsRes.data.students || studentsRes.data || [];
      const complaintsData = complaintsRes.data || [];

      const activeStatuses = ["Pending", "Accepted", "Scheduled", "In Progress"];
      setStats({
        newComplaints: complaintsData.filter(c => activeStatuses.includes(c.status)).length,
        resolvedComplaints: complaintsData.filter(c => c.status === 'Resolved').length,
        activeNotices: notices.length,
        totalStudents: studentsData.length || 0
      });

      // Filter to only active complaints for the quick table
      setComplaints(complaintsData.filter(c => activeStatuses.includes(c.status)).slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };


  // 1. Columns Definition
  const columns = [
    { key: "studentName", label: "Student" },
    { key: "issue", label: "Issue", render: (_, row) => row.category + " - " + row.description },
    { key: "roomNumber", label: "Room", render: (_, row) => row.student?.roomNumber || 'N/A' },
    { 
      key: "status", 
      label: "Status", 
      render: (val) => <StatusBadge status={val} /> 
    },
    {
      key: "actions",
      label: "Action",
      render: (_, row) => (
        row.status === "Pending" && (
          <Link 
            href="/dashboard/caretaker/complaints"
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            Review Issue
          </Link>
        )
      )
    }
  ];


 return (
    <DashboardLayout role="caretaker">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className={`text-2xl font-bold ${isCaretaker ? "text-slate-700" : "text-slate-800"}`}>Caretaker Dashboard</h1>
        </div>
        
        <div className="flex gap-3">
          {/* Now triggers state instead of a link */}
          <button 
            onClick={() => setIsNoticeModalOpen(true)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Post New Notice
          </button>
        </div>
      </div>

      <StatsGrid stats={[
        { label: "Active Complaints", value: (stats.newComplaints || 0).toString(), colorClass: "bg-orange-50/50 text-orange-700 border border-orange-200 hover:bg-orange-100/70 transition cursor-pointer", onClick: () => window.location.href = "/dashboard/caretaker/complaints" },
        { label: "Resolved", value: (stats.resolvedComplaints || 0).toString(), colorClass: "bg-emerald-50/50 text-emerald-700 border border-emerald-200" },
        // WRAP THE NOTICE STAT IN A CLICKABLE LINK
        { 
          label: "Active Notices", 
          value: (stats.activeNotices || 0).toString(), 
          colorClass: "bg-blue-50/50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100/70 transition",
          onClick: () => window.location.href = "/dashboard/caretaker/notices" 
        },
        { label: "Total Students", value: (stats.totalStudents || 0).toString(), colorClass: "bg-indigo-50/50 text-indigo-700 border border-indigo-200 cursor-pointer hover:bg-indigo-100/70 transition", onClick: () => window.location.href = "/dashboard/caretaker/students" },
      ]} />

      {/* 2. CHARTS SECTION */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COMPLAINT STATUS DONUT */}
        <div className="bg-purple-100 backdrop-blur-md p-8 rounded-[3rem] shadow-xl shadow-purple-200/30 border border-purple-200/50 group transition-all duration-500 hover:shadow-purple-300/40 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl group-hover:bg-purple-400/40 transition-colors" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-sm font-black text-purple-500 uppercase tracking-widest">Issue Resolution</h3>
            <span className="text-[10px] font-black text-purple-700 bg-white px-4 py-1.5 rounded-full shadow-sm border border-purple-100 uppercase tracking-tighter">Real-time Data</span>
          </div>
          <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {complaintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#7e22ce' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 text-center relative z-10">
            <p className="text-[10px] text-purple-500/80 font-black uppercase tracking-widest italic">
              * Current Complaint Distribution
            </p>
          </div>
        </div>

        {/* RESOURCE ALLOCATION BAR */}
        <div className="bg-purple-100 backdrop-blur-md p-8 rounded-[3rem] shadow-xl shadow-purple-200/30 border border-purple-200/50 group transition-all duration-500 hover:shadow-purple-300/40 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-300/30 rounded-full blur-3xl group-hover:bg-purple-400/40 transition-colors" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-sm font-black text-purple-500 uppercase tracking-widest">Resident Activity</h3>
            <span className="text-[10px] font-black text-emerald-700 bg-white px-4 py-1.5 rounded-full shadow-sm border border-emerald-100 uppercase tracking-tighter">Live Growth</span>
          </div>
          <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#7e22ce', fontSize: 11, fontWeight: 900 }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.4)', radius: 15 }}
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[20, 20, 20, 20]} 
                  barSize={45}
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-around gap-4 border-t border-slate-50 pt-4">
            <div className="flex-1 text-center bg-indigo-50/50 py-3 rounded-2xl border border-indigo-100/50">
              <p className="text-[10px] text-indigo-400 font-black uppercase mb-1">Students</p>
              <p className="text-xl font-black text-indigo-700">{stats.totalStudents}</p>
            </div>
            <div className="flex-1 text-center bg-blue-50/50 py-3 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] text-blue-400 font-black uppercase mb-1">Active Notices</p>
              <p className="text-xl font-black text-blue-700">{stats.activeNotices}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border ${isCaretaker ? "border-blue-200" : "border-slate-200"}`}>
        <div className={`px-6 py-5 border-b ${isCaretaker ? "border-blue-100" : "border-slate-100"}`}>
          <h2 className={`text-lg font-bold ${isCaretaker ? "text-slate-800" : "text-slate-800"}`}>Recent Active Complaints</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category & Issue</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((row) => {
                const categoryColors = {
                  'Electrical': 'bg-amber-50/40 hover:bg-amber-100/60',
                  'Plumbing': 'bg-blue-50/40 hover:bg-blue-100/60',
                  'Furniture': 'bg-rose-50/40 hover:bg-rose-100/60',
                  'Internet': 'bg-indigo-50/40 hover:bg-indigo-100/60',
                  'Cleaning': 'bg-emerald-50/40 hover:bg-emerald-100/60',
                  'Other': 'bg-slate-50/40 hover:bg-slate-100/60'
                };
                const rowBg = categoryColors[row.category] || 'bg-white hover:bg-slate-50/80';
                
                return (
                  <tr key={row._id} className={`transition-colors ${rowBg}`}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.studentName}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-tight mb-0.5">{row.category}</p>
                      <p className="text-sm font-medium text-slate-600 truncate max-w-[200px]">{row.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{row.student?.roomNumber || 'N/A'}</td>
                    <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                    <td className="px-6 py-4">
                      {row.status === "Pending" && (
                        <Link 
                          href="/dashboard/caretaker/complaints"
                          className="text-indigo-600 hover:text-indigo-900 font-black text-[10px] uppercase tracking-widest"
                        >
                          Review
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No active complaints
                  </td>
                </tr>
              )}
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
    </DashboardLayout>
  );
}