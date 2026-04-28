"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard(){
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(()=>{
    if (!loading && !user) router.push("/login");
    if (!loading && user) {
      if (user.role === "admin") router.push("/dashboard/admin");
      else if (user.role === "warden") router.push("/dashboard/warden");
      else if (user.role === "caretaker") router.push("/dashboard/caretaker/students");
      else router.push("/dashboard/student");
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
      <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">
        Loading...
      </div>
    </div>
  );
}

