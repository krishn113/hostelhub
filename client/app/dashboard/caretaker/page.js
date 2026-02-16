"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import axios from "axios";
import api from "@/utils/api";
import Link from "next/link";
import NoticeForm from "@/components/NoticeForm";

export default function CaretakerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For Modal
  const [techDate, setTechDate] = useState("");
  const fileInputRef = useRef(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);


  // 1. Columns Definition
  const columns = [
    { key: "studentName", label: "Student" },
    { key: "issue", label: "Issue" },
    { key: "roomNumber", label: "Room" },
    { 
      key: "status", 
      label: "Status", 
      render: (val) => <StatusBadge status={val} /> 
    },
    {
      key: "actions",
      label: "Action",
      render: (_, row) => (
        row.status === "pending" && (
          <button 
            onClick={() => setSelectedComplaint(row)}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            Accept Issue
          </button>
        )
      )
    }
  ];


 return (
    <DashboardLayout role="caretaker">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Caretaker Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage hostel maintenance and student rooms</p>
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
        { label: "New Complaints", value: "8", colorClass: "bg-orange-50 text-orange-600" },
        { label: "Resolved", value: "42", colorClass: "bg-green-50 text-green-600" },
        // WRAP THE NOTICE STAT IN A CLICKABLE LINK
        { 
          label: "Active Notices", 
          value: "3", 
          colorClass: "bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition",
          onClick: () => router.push("/dashboard/caretaker/notices") 
        },
        { label: "Total Students", value: "240", colorClass: "bg-indigo-50 text-indigo-600" },
      ]} />
      
      {/* Global Notice Form */}
      <NoticeForm 
        isOpen={isNoticeModalOpen} 
        onClose={() => setIsNoticeModalOpen(false)} 
        onSuccess={() => {/* You could refresh notice counts here */}} 
      />
    </DashboardLayout>
  );
}