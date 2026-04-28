"use client";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user } = useAuth(); // Assuming 'user' object is in your context

  return (
    <div className="h-16 bg-white border-b border-slate-100 flex justify-end items-center px-8">
      {/* Profile Section */}
      <Link href="/dashboard/profile" className="flex items-center gap-3 group">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
            {user?.name || "User Name"}
          </p>
          <p className="text-xs text-slate-500 capitalize">{user?.role || "Caretaker"}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold overflow-hidden group-hover:border-indigo-200 transition">
          {user?.avatar ? (
            <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0) || "U"
          )}
        </div>
      </Link>
    </div>
  );
}