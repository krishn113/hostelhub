"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

import {
  Building2,
  Users,
  DoorOpen,
  BedDouble,
  Percent
} from "lucide-react";

export default function AdminDashboard() {

  const [stats, setStats] = useState({});
  const [hostelOccupancy, setHostelOccupancy] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      const statsRes = await API.get("/admin/dashboard");
      const hostelRes = await API.get("/admin/dashboard/hostel-occupancy");

      setStats(statsRes.data);
      setHostelOccupancy(hostelRes.data);

    } catch (err) {
      console.log(err);
    }
  };

  const statCards = [
    {
      label: "Total Hostels",
      value: stats.totalHostels || 0,
      icon: Building2,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      label: "Total Rooms",
      value: stats.totalRooms || 0,
      icon: DoorOpen,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      label: "Total Capacity",
      value: stats.totalCapacity || 0,
      icon: BedDouble,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      label: "Occupied Beds",
      value: stats.occupiedBeds || 0,
      icon: Users,
      color: "bg-orange-50 text-orange-600 border-orange-100"
    },
    {
      label: "Occupancy Rate",
      value: `${stats.occupancyRate || 0}%`,
      icon: Percent,
      color: "bg-pink-50 text-pink-600 border-pink-100"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-slate-900">
          Admin Overview
        </h1>
        <p className="text-slate-500 italic">
          Hostel capacity insights
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">

        {statCards.map((s, i) => {
          const Icon = s.icon;

          return (
            <div
              key={i}
              className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition ${s.color}`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wide opacity-70">
                  {s.label}
                </span>

                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon size={18} />
                </div>
              </div>

              <p className="text-3xl font-extrabold tracking-tight">
                {s.value}
              </p>
            </div>
          );
        })}

      </div>


      {/* HOSTEL OCCUPANCY */}
      <div className="bg-white p-8 rounded-[2rem] border shadow-sm">

        <h2 className="text-lg font-bold mb-6">
          Hostel Occupancy
        </h2>

        <div className="space-y-6">

          {hostelOccupancy.map((h, i) => {

            const percent =
              h.capacity === 0
                ? 0
                : Math.round((h.occupied / h.capacity) * 100);

            return (
              <div key={i}>

                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span>{h.name}</span>
                  <span>{percent}%</span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full">

                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
                    style={{ width: `${percent}%` }}
                  />

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}