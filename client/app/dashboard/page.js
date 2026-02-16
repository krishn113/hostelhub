"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard(){
  const { user } = useAuth();
  const router = useRouter();
  useEffect(()=>{ if(!user) router.push("/login"); },[user]);
  if(!user) return null;
  return <div className="p-6">Welcome {user.email} 🎉</div>;
}
