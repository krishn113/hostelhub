"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import API from "@/lib/api";
import {
  MessageSquare,
  Bell,
  ArrowUpRight,
  Home,
  AlertCircle,
  Pin,
  Wrench,
  Clock,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [techVisit, setTechVisit] = useState(null);
  const [pinnedNotices, setPinnedNotices] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [statsData, setStatsData] = useState({ issues: 0, notices: 0 });
  const [caretakerInfo, setCaretakerInfo] = useState(null);
  const [hostelName, setHostelName] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0 }
  };

  const toggleNotice = (id) => {
    setExpandedNoticeId(prev => (prev === id ? null : id));
  };

  // Logic for fetching dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.year || !user?.gender || !user?.degreeType) return;

      try {
        const allocRes = await API.get("/allocations/find", {
          params: {
            year: user.year,
            gender: user.gender,
            degreeType: user.degreeType
          }
        });

        if (allocRes.data?.caretakerEmail) {
          setCaretakerInfo({
            email: allocRes.data.caretakerEmail,
            phone: allocRes.data.caretakerPhone
          });
        }

        if (allocRes.data?.hostelId?.name) {
          setHostelName(allocRes.data.hostelId.name);
        }

        const hostelId = allocRes.data?.hostelId?._id || allocRes.data?.hostelId;

        if (hostelId) {
          // 1. Fetch Notices
          const noticeRes = await API.get("/notices", {
            params: { hostel: hostelId }
          });

          // 2. Fetch Complaints (The fix is here)
          const complaintRes = await API.get("/complaints/my-complaints");
          
          // Safety Check: handle both direct array and nested array responses
          const complaintsArray = Array.isArray(complaintRes.data) 
            ? complaintRes.data 
            : (complaintRes.data.complaints || []);

          const activeIssuesCount = complaintsArray.filter(c => c.status !== 'Resolved').length;

          if (noticeRes.data && Array.isArray(noticeRes.data)) {
            const sorted = noticeRes.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setStatsData({ issues: activeIssuesCount, notices: noticeRes.data.length });

            const pinned = sorted.filter(n => n.isPinned);
            const rest = sorted.filter(n => !n.isPinned);
            setPinnedNotices([...pinned, ...rest].slice(0, 3));
          }

          // 3. Process Recent Complaints (Correctly Scoped)
          const sortedComplaints = complaintsArray
            .filter(c => c.status !== "Resolved")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          
          // MOVE THIS INSIDE THE ASYNC FUNCTION
          setRecentComplaints(sortedComplaints);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };

    if (user) fetchDashboardData();
  }, [user]); // Removed activeTab to avoid unnecessary fetches when switching tabs unless needed

  // Loading State
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
        <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">
          Loading Student Portal...
        </div>
      </div>
    );
  }

  // Room Assignment Check
  if (!user.roomNumber) {
    return (
        <div className="min-h-screen bg-[#F0F7FF] flex flex-col font-sans">
          <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-blue-200 px-6 flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-black text-blue-700">HostelHub</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management System</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors font-bold text-sm shadow-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </header>
  
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 flex flex-col items-center justify-center p-4 md:p-8"
          >
            <motion.div variants={itemVariants} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 max-w-xl w-full flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <Home size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Room Not Assigned</h2>
                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-sm mx-auto">
                  Your room allocation {hostelName ? <span className="font-bold text-slate-700">for {hostelName}</span> : ""} is currently pending. Please contact your hostel caretaker for further assistance.
                </p>
              </div>
  
              {caretakerInfo ? (
                <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center mt-2 group hover:bg-indigo-50/50 transition-colors">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover:text-indigo-400 transition-colors">Contact Caretaker</p>
                  <a href={`mailto:${caretakerInfo.email}`} className="text-indigo-600 font-bold text-lg hover:underline mb-1">
                    {caretakerInfo.email}
                  </a>
                  {caretakerInfo.phone && <p className="text-slate-500 text-sm font-medium">{caretakerInfo.phone}</p>}
                </div>
              ) : (
                <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-center mt-2">
                   <p className="text-xs font-bold text-slate-400 animate-pulse">Loading Contact Info...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      );
  }

  return (
    <DashboardLayout role="student" activeTab={activeTab} setActiveTab={setActiveTab}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Hey, {user.name?.split(' ')[0]}!
            </h1>
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={() => router.push("/dashboard/student/complaints")}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
          >
            <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
            Post Complaint
          </motion.button>
        </div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <StatsGrid
              stats={[
                {
                  label: "My Room",
                  value: user.roomNumber || "Pending",
                  icon: <Home size={18} />,
                  colorClass: "bg-emerald-50 text-emerald-600 border border-emerald-100"
                },
                {
                  label: "Unresolved Issues",
                  value: statsData.issues.toString(),
                  icon: <AlertCircle size={18} />,
                  colorClass: "bg-rose-50 text-rose-600 border border-rose-100"
                },
              ]}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Notices Card */}
            <motion.div variants={itemVariants} className="p-5 md:p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col gap-3 min-h-[160px]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">📌 Notices</h3>
                <button onClick={() => router.push("/dashboard/student/notices")} className="text-indigo-600 text-[11px] font-bold flex items-center gap-1">
                  View All <ArrowUpRight size={12} />
                </button>
              </div>
              {pinnedNotices.length > 0 ? (
                <div className="space-y-3">
                  {pinnedNotices.map((n) => (
                    <div key={n._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <p onClick={() => toggleNotice(n._id)} className="text-sm font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors">
                        {n.title}
                      </p>
                      {expandedNoticeId === n._id && <p className="text-xs text-slate-500 mt-2">{n.content}</p>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm">No notices found.</p>}
            </motion.div>

            {/* Complaints Card */}
            <motion.div variants={itemVariants} className="p-5 md:p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col gap-3 min-h-[160px]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">🔧 My Complaints</h3>
                <button onClick={() => router.push("/dashboard/student/complaints")} className="text-indigo-600 text-[11px] font-bold flex items-center gap-1">
                  View All <ArrowUpRight size={12} />
                </button>
              </div>
              {recentComplaints.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {recentComplaints.map((c) => (
                    <div key={c._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Wrench size={14} className="text-indigo-600" />
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{c.title}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-amber-100 text-amber-700">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm">No active complaints.</p>}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}