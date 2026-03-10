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

export default function CaretakerDashboard() {
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
           <h1 className="text-2xl font-bold text-slate-800">Caretaker Dashboard</h1>
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
        { label: "Active Complaints", value: (stats.newComplaints || 0).toString(), colorClass: "bg-orange-50 text-orange-600 cursor-pointer hover:bg-orange-100", onClick: () => window.location.href = "/dashboard/caretaker/complaints" },
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
          <h2 className="text-lg font-bold text-slate-800">Recent Active Complaints</h2>
        </div>
        <DataTable columns={columns} data={complaints} />
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