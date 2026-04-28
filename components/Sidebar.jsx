"use client";
const navConfig = {
  caretaker: [
    { label: "Overview", icon: "📊", href: "/dashboard/caretaker" },
    { label: "Student List", icon: "👥", href: "/dashboard/caretaker/students" },
    { label: "Complaints", icon: "🛠️", href: "/dashboard/caretaker/complaints" },
    { label: "Notices", icon: "📢", href: "/dashboard/caretaker/notices" },
    { label: "Forms", icon: "📝", href: "/dashboard/caretaker/forms" },
  ],
  warden: [
    { label: "Warden Dashboard", icon: "🏛️", href: "/dashboard/warden" },
    { label: "All Complaints", icon: "📋", href: "/dashboard/warden/complaints" },
    { label: "Guest House Forms", icon: "🏨", href: "/dashboard/warden/forms" },
  ],
};

import { useAuth } from "../context/AuthContext";

export default function Sidebar({ role }) {
  const { logout } = useAuth();
  const links = navConfig[role] || [];
  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen">
      <div className="p-6 font-bold text-indigo-600 text-xl tracking-tight">HostelHub</div>
      <nav className="mt-4 px-4 space-y-2 flex-1">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition">
            <span>{link.icon}</span> {link.label}
          </a>
        ))}
      </nav>
      {/* Small Logout Button at Bottom */}
      <div className="p-4 border-t border-slate-100">
         <button onClick={logout} className="flex items-center gap-3 p-3 w-full text-slate-500 hover:text-red-600 transition text-sm">
           🚪 Logout
         </button>
      </div>
    </aside>
  );
}