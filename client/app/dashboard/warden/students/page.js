"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";

export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, occupiedRooms: 0, emptyRooms: 0 });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
const [floorFilter, setFloorFilter] = useState("All");
const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentRes, statsRes] = await Promise.all([
        API.get("/caretaker/students"), // You need to add this route
        API.get("/caretaker/room-stats")
      ]);
      setStudents(studentRes.data.students || studentRes.data);
      setStats(statsRes.data);
      if (studentRes.data.debugLog) {
        console.log("Backend Debug Log (Fetch):", studentRes.data.debugLog);
      }
    } catch (err) {
      console.error("Data fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await API.get(`/caretaker/download-students?t=${Date.now()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hostel_residents_v3.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) { alert("Download failed"); }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await API.post("/caretaker/upload-rooms", formData);
      if (res.data.debugLog) {
        console.log("Backend Debug Log (Upload):", res.data.debugLog);
      }
      alert("Rooms updated successfully!");
      fetchData(); // Refresh list and stats
    } catch (err) { alert("Upload failed"); }
  };

  const filteredStudents = students.filter(student => {
  const matchesSearch = 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.entryNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase());

  // Logic: Use student.floorNumber if it exists, otherwise fallback to room parsing
  const studentFloor = student.floorNumber || (student.roomNumber ? Math.floor(parseInt(student.roomNumber) / 100).toString() : "None");
  const matchesFloor = floorFilter === "All" || studentFloor === floorFilter;
  
  const matchesStatus = 
    statusFilter === "All" || 
    (statusFilter === "Assigned" ? !!student.roomNumber : !student.roomNumber);

  return matchesSearch && matchesFloor && matchesStatus;
});

 return (
  <DashboardLayout role="warden">
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Resident Hub</h1>
          <p className="text-slate-500 font-medium">Manage allocations and analyze hostel occupancy.</p>
        </div>
        
      </header>

      {/* 2. ANALYTICS RIBBON (The Stats You Requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition">👥</div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Residents</p>
          <h2 className="text-3xl font-black text-slate-800">{students.length}</h2>
          <p className="text-[10px] text-indigo-500 font-bold mt-2">Active Profiles</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition">✅</div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rooms Allotted</p>
          <h2 className="text-3xl font-black text-green-600">
            {students.filter(s => s.roomNumber).length}
          </h2>
          <p className="text-[10px] text-green-500 font-bold mt-2">Occupancy: {((students.filter(s => s.roomNumber).length / students.length) * 100).toFixed(1)}%</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition">⚠️</div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Allocation</p>
          <h2 className="text-3xl font-black text-amber-500">
            {students.filter(s => !s.roomNumber).length}
          </h2>
          <p className="text-[10px] text-amber-500 font-bold mt-2">Awaiting Rooms</p>
        </div>

        <div className="bg-indigo-900 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-4xl text-white group-hover:scale-110 transition">🏢</div>
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 text-white/60">Hostel Capacity</p>
          <h2 className="text-3xl font-black text-white">250</h2>
          <p className="text-[10px] text-indigo-200 font-bold mt-2">Available: {250 - students.filter(s => s.roomNumber).length} Beds</p>
        </div>
      </div>

      {/* 3. SEARCH & DYNAMIC FILTERS */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search by name, email, or entry number..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm focus:ring-2 focus:ring-indigo-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-6 py-4 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Floors</option>
              {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>Floor {f}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase px-6 py-4 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MASTER STUDENT TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Floor</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Room Number</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg border-2 border-white shadow-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{student.name}</p>
                          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Degree - {student.degreeType || "B.Tech"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-mono">
                      <p className="text-xs font-bold text-slate-400 mb-1">Entry No.</p>
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-700 uppercase tracking-tighter">
                        {student.entryNumber || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {student.floorNumber ? `Floor ${student.floorNumber}` : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {student.roomNumber ? (
                        <div className="inline-block px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1 group-hover:text-indigo-100">Room</p>
                          <p className="text-sm font-black text-indigo-700 group-hover:text-white">{student.roomNumber}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-red-500 uppercase px-3 py-1 bg-red-50 rounded-full border border-red-100 animate-pulse">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                           📧 {student.email}
                        </p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                           📞 {student.phone || "No Phone"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center bg-white rounded-b-[2.5rem]">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No residents found matching filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
);
}