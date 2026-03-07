"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function DashboardLayout({ children, role }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Define separate menus for each role
  const menus = {
    student: [
      { label: "Overview", icon: "🏠", path: "/dashboard/student" },
      { label: "Notices", icon: "📢", path: "/dashboard/student/notices" },
      { label: "Complaints", icon: "🛠️", path: "/dashboard/student/complaints" },
      { label: "Forms", icon: "📄", path: "/dashboard/student/forms" },
    ],
    caretaker: [
      { label: "Overview", icon: "🏠", path: "/dashboard/caretaker" },
      { label: "Students Lists", icon: "📊", path: "/dashboard/caretaker/students" },
      { label: "Complaints", icon: "🛠️", path: "/dashboard/caretaker/complaints" },
      { label: "Notices", icon: "📝", path: "/dashboard/caretaker/notices" },
    ],
    warden: [
      { label: "Overview", icon: "🏠", path: "/dashboard/warden" },
      { label: "Students Lists", icon: "📊", path: "/dashboard/caretaker/students" },
      { label: "Complaints", icon: "🛠️", path: "/dashboard/caretaker/complaints" },
      { label: "Notices", icon: "📝", path: "/dashboard/caretaker/notices" },
    ]
  };

  // Select the current menu based on the role prop
  const currentMenu = menus[role] || [];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-6">
          <h2 className="text-xl font-black text-indigo-600 ">HostelHub</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management System</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {currentMenu.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                pathname === item.path 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64">
        {/* DYNAMIC TOP NAV */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex justify-end items-center">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
            <div className="text-right">
              {/* This label now changes based on the role prop */}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{role}</p>
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              {user?.name?.[0]}
            </div>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}