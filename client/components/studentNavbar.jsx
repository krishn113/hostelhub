"use client";
import { UserCircle, Bell, LayoutDashboard, FileText, MessageSquare } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'notices', label: 'Notices', icon: <Bell size={20} /> },
    { id: 'complaints', label: 'Complaints', icon: <MessageSquare size={20} /> },
    { id: 'forms', label: 'Forms', icon: <FileText size={20} /> },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl px-6 py-3 flex justify-between items-center z-50">
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 transition-all duration-300 ${
              activeTab === tab.id ? "text-indigo-600 font-bold" : "text-gray-500 hover:text-indigo-400"
            }`}
          >
            {tab.icon}
            <span className="hidden md:block">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Profile Icon - Only see details here */}
      <button 
        onClick={() => setActiveTab('profile')}
        className={`p-1 rounded-full border-2 transition-all ${
          activeTab === 'profile' ? "border-indigo-600" : "border-transparent"
        }`}
      >
        <UserCircle size={32} className="text-gray-700 hover:text-indigo-600 transition-colors" />
      </button>
    </nav>
  );
}