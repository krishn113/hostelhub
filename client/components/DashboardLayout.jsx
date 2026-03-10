"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function DashboardLayout({ children, role }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      { label: "Forms", icon: "📄", path: "/dashboard/caretaker/forms" },
    ],
    warden: [
      { label: "Overview", icon: "🏠", path: "/dashboard/warden" },
      { label: "Students Lists", icon: "📊", path: "/dashboard/warden/students" },
      { label: "Complaints", icon: "🛠️", path: "/dashboard/warden/complaints" },
      { label: "Notices", icon: "📝", path: "/dashboard/warden/notices" },
      { label: "Forms", icon: "📄", path: "/dashboard/warden/forms" },
    ],
    admin: [
      { label: "Overview", icon: "🏠", path: "/dashboard/admin" },
      { label: "Allocations", icon: "📊", path: "/dashboard/admin/allocations" },
      { label: "Hostels", icon: "🛠️", path: "/dashboard/admin/hostels" },
      { label: "Staff", icon: "📝", path: "/dashboard/admin/staff" },
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
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex justify-between items-center">
          <div className="flex-1 flex items-center">
            {user?.hostelName && (
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                🏠 {user.hostelName} 
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-bold uppercase tracking-widest">
                  {user.role === 'student' ? 'Hostel' : role}
                </span>
              </h2>
            )}
          </div>

          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-200 transition"
          >
            <div className="text-right">
              {/* This label now changes based on the role prop */}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                {user?.role === "caretaker" || user?.role === "warden" 
                  ? `${role} ${user?.hostelName || ''}`.trim()
                  : role}
              </p>
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              {user?.name?.[0]}
            </div>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>

      {/* Global Profile Modal */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 scale-in-center">
            <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700"></div>
               <div className="relative z-10">
                 <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-black text-indigo-600 shadow-xl border-4 border-indigo-100 mb-3">
                   {user.name?.charAt(0) || 'U'}
                 </div>
                 <h2 className="text-2xl font-black text-white leading-tight">{user.name}</h2>
                 <p className="text-indigo-100 text-sm font-medium mt-1 capitalize">
                   {user.role}
                 </p>
               </div>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
               {(user.role === 'caretaker' || user.role === 'warden' || user.role === 'student') && (
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                      {user.role === 'student' ? 'Assigned Location' : 'Assigned Hostel'}
                    </p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                         <span className="text-slate-800 font-bold">🏠 {user.hostelName || 'Unassigned'}</span>
                         {user.hostelType && (
                           <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md">
                             {user.hostelType} Hostel
                           </span>
                         )}
                      </div>
                      {user.role === 'student' && user.roomNumber && (
                         <div className="pt-2 border-t border-slate-200/60 mt-1">
                            <span className="text-slate-700 font-bold text-sm">🚪 Room {user.roomNumber}</span>
                            {user.floorNumber && <span className="text-slate-500 font-medium text-xs ml-2">(Floor {user.floorNumber})</span>}
                         </div>
                      )}
                    </div>
                 </div>
               )}

               {(user.role === 'student' || user.role === 'caretaker') && (
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                      {user.role === 'student' ? 'Academic Profile' : 'Personal Profile'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {user.entryNumber && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Entry Number</p>
                          <p className="text-sm font-bold text-slate-800 tracking-wide">{user.entryNumber}</p>
                        </div>
                      )}
                      {user.role === 'student' && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Year</p>
                          <p className="text-sm font-bold text-slate-800">{user.year || 'N/A'}</p>
                        </div>
                      )}
                      <div className={`bg-slate-50 p-3 rounded-xl border border-slate-100 ${user.role === 'caretaker' && !user.entryNumber ? 'col-span-2' : ''}`}>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Gender</p>
                         <p className="text-sm font-bold text-slate-800 capitalize">{user.gender || 'N/A'}</p>
                      </div>
                      {user.role === 'student' && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                           <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Degree Type</p>
                           <p className="text-sm font-bold text-slate-800">{user.degreeType || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                 </div>
               )}

               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Contact Details</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                    <p className="text-slate-800 font-bold flex items-center gap-3">
                      <span className="text-lg">✉️</span> 
                      <span className="text-sm truncate">{user.email}</span>
                    </p>
                    {user.phone && (
                      <p className="text-slate-800 font-bold flex items-center gap-3 pt-3 border-t border-slate-200/60">
                        <span className="text-lg">📞</span> 
                        <span className="text-sm">{user.phone}</span>
                      </p>
                    )}
                  </div>
               </div>

               <button 
                 onClick={() => setIsProfileModalOpen(false)}
                 className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition shadow-sm"
               >
                 Close Profile
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}