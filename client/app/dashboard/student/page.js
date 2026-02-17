"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import { MessageSquare, Bell, FileText, ArrowUpRight } from "lucide-react";
export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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
            {activeTab === 'overview' ? `You are currently in ${user.hostelName} Hostel` : `Manage your ${activeTab} requests here.`}
          </p>
        </div>
        
        {activeTab === "overview" && (
          <button 
            onClick={() => setActiveTab("complaints")} 
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 group"
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
              { label: "My Room", value: user.roomNumber || "Pending", colorClass: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
              { label: "Active Issues", value: "0", colorClass: "bg-rose-50 text-rose-600 border border-rose-100" },
              { label: "New Notices", value: "2", colorClass: "bg-amber-50 text-amber-600 border border-amber-100" },
              { label: "Hostel", value: user.hostelName || "N/A", colorClass: "bg-indigo-50 text-indigo-600 border border-indigo-100" },
            ]} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Bell size={80} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">Latest Notice 📢</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    The mess will serve special dinner today for the {user.hostelName} community at 8:00 PM.
                  </p>
                  <button onClick={() => setActiveTab('notices')} className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                    Read More <ArrowUpRight size={14} />
                  </button>
               </div>

               <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl text-white shadow-indigo-200">
                  <h3 className="font-bold text-lg mb-2">Technician Visit 🛠️</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">
                    Great news! Your electrical issue in Room {user.roomNumber} has been acknowledged.
                  </p>
                  <div className="mt-4 inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold">
                    Arrival: Tomorrow, 10:30 AM
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