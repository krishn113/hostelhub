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

export default function CaretakerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For Modal
  const [techDate, setTechDate] = useState("");
  const fileInputRef = useRef(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [stats, setStats] = useState({ 
    newComplaints: 0, 
    resolvedComplaints: 0, 
    activeNotices: 0, 
    totalStudents: 0 
  });
  const [caretakerInfo, setCaretakerInfo] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch User Info
      const userRes = await api.get('/auth/me');
      setCaretakerInfo(userRes.data);

      // Fetch Stats Parallel
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

      // Filter to only pending complaints for the quick table
      setComplaints(complaintsData.filter(c => c.status === 'Pending').slice(0, 5));
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
    <DashboardLayout role="warden">
      <div className="flex justify-between items-center mb-8">
        <div 
          onClick={() => setIsProfileModalOpen(true)} 
          className="cursor-pointer group hover:bg-slate-100 p-3 -ml-3 rounded-2xl transition"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white w-12 h-12 flex justify-center items-center rounded-xl shadow-lg font-black text-xl group-hover:scale-105 transition">
              C
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Warden Dashboard</h1>
              <p className="text-slate-500 text-sm flex items-center gap-1 group-hover:text-indigo-600 transition">
                {caretakerInfo ? `Managing ${caretakerInfo.hostelName || 'Hostel'}` : "Loading Profile..."} 
                <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full ml-1">View Details</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Now triggers state instead of a link */}
          <button 
            onClick={() => setIsNoticeModalOpen(true)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Post New Notice
          </button>
        </div>
      </div>

      <StatsGrid stats={[
        { label: "New Complaints", value: (stats.newComplaints || 0).toString(), colorClass: "bg-orange-50 text-orange-600 cursor-pointer hover:bg-orange-100", onClick: () => window.location.href = "/dashboard/caretaker/complaints" },
        { label: "Resolved", value: (stats.resolvedComplaints || 0).toString(), colorClass: "bg-green-50 text-green-600" },
        // WRAP THE NOTICE STAT IN A CLICKABLE LINK
        { 
          label: "Active Notices", 
          value: (stats.activeNotices || 0).toString(), 
          colorClass: "bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition",
          onClick: () => window.location.href = "/dashboard/caretaker/notices" 
        },
        { label: "Total Students", value: (stats.totalStudents || 0).toString(), colorClass: "bg-indigo-50 text-indigo-600 cursor-pointer hover:bg-indigo-100", onClick: () => window.location.href = "/dashboard/caretaker/students" },
      ]} />

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Recent Pending Complaints</h2>
        </div>
        <DataTable columns={columns} data={complaints} />
      </div>
      
      {/* Global Notice Form */}
      <NoticeForm 
        isOpen={isNoticeModalOpen} 
        onClose={() => setIsNoticeModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />

      {/* Caretaker Profile Modal */}
      {isProfileModalOpen && caretakerInfo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 scale-in-center">
            <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700"></div>
               <div className="relative z-10">
                 <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-black text-indigo-600 shadow-xl border-4 border-indigo-100 mb-3">
                   {caretakerInfo.name?.charAt(0) || 'C'}
                 </div>
                 <h2 className="text-2xl font-black text-white leading-tight">{caretakerInfo.name}</h2>
                 <p className="text-indigo-100 text-sm font-medium mt-1">Official Caretaker</p>
               </div>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Assigned Hostel</p>
                  <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                    <span>🏠 {caretakerInfo.hostelName || 'Unassigned'}</span>
                    {caretakerInfo.hostelType && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md">
                        {caretakerInfo.hostelType} Hostel
                      </span>
                    )}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Email Address</p>
                  <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    ✉️ {caretakerInfo.email}
                  </p>
               </div>
               {caretakerInfo.phone && (
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Phone Number</p>
                    <p className="text-slate-800 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                      📞 {caretakerInfo.phone}
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