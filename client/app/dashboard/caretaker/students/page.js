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
  const [roomSearch, setRoomSearch] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editRoomValue, setEditRoomValue] = useState("");
  const [savingRoom, setSavingRoom] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentRes, statsRes] = await Promise.all([
        API.get("/caretaker/students"),
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

  const handleSaveRoom = async (studentId) => {
    try {
      setSavingRoom(true);
      await API.put(`/caretaker/student/${studentId}/room`, { roomNumber: editRoomValue });
      alert("Room updated successfully!");
      setEditingStudentId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update room");
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDownload = async () => {
    try {
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
      fetchData();
    } catch (err) { alert("Upload failed"); }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.entryNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const studentFloor = student.floorNumber || (student.roomNumber ? Math.floor(parseInt(student.roomNumber) / 100).toString() : "None");
    const matchesFloor = floorFilter === "All" || studentFloor === floorFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Assigned" ? !!student.roomNumber : !student.roomNumber);

    const matchesRoom =
      roomSearch.trim() === "" ||
      (student.roomNumber || "").toLowerCase().includes(roomSearch.trim().toLowerCase());

    return matchesSearch && matchesFloor && matchesStatus && matchesRoom;
  });

  // Dynamically derive unique floors from assigned rooms
  const availableFloors = Array.from(
    new Set(
      students
        .filter(s => s.roomNumber)
        .map(s => {
          if (s.floorNumber) return s.floorNumber;
          const firstDigit = s.roomNumber.toString().trim()[0];
          return firstDigit === '0' ? 'G' : firstDigit;
        })
    )
  ).sort((a, b) => {
    if (a === 'G') return -1;
    if (b === 'G') return 1;
    return Number(a) - Number(b);
  });

  const assignedCount = students.filter(s => s.roomNumber).length;
  const unassignedCount = students.filter(s => !s.roomNumber).length;

  return (
    <DashboardLayout role="caretaker">
      <div className="p-4 md:p-8 min-h-screen" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}>

        {/* 1. TOP HEADER & PRIMARY ACTIONS */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Resident Hub
            </h1>
            <p className="text-slate-500 font-semibold mt-1">Manage allocations and analyze hostel occupancy.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all shadow-sm"
            >
              📥 Export List
            </button>
            <input type="file" ref={fileInputRef} onChange={handleExcelUpload} className="hidden" accept=".xlsx, .xls" />
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
            >
              📤 Upload Allocation
            </button>
          </div>
        </header>

        {/* 2. STAT CARDS — each section gets a vivid solid gradient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Residents — deep indigo */}
          <div className="relative overflow-hidden rounded-3xl p-6 shadow-lg text-white" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Total Residents</p>
            <h2 className="text-4xl font-black">{students.length}</h2>
            <p className="text-[10px] text-indigo-200 font-bold mt-2">👥 Active Profiles</p>
          </div>

          {/* Rooms Allotted — vivid emerald */}
          <div className="relative overflow-hidden rounded-3xl p-6 shadow-lg text-white" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">Rooms Allotted</p>
            <h2 className="text-4xl font-black">{assignedCount}</h2>
            <p className="text-[10px] text-emerald-100 font-bold mt-2">✅ Occupancy: {((assignedCount / (students.length || 1)) * 100).toFixed(1)}%</p>
          </div>

          {/* Pending Allocation — vivid amber */}
          <div className="relative overflow-hidden rounded-3xl p-6 shadow-lg text-white" style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-100 mb-1">Pending Allocation</p>
            <h2 className="text-4xl font-black">{unassignedCount}</h2>
            <p className="text-[10px] text-amber-100 font-bold mt-2">⚠️ Awaiting Rooms</p>
          </div>

          {/* Hostel Capacity — vivid cyan/blue */}
          <div className="relative overflow-hidden rounded-3xl p-6 shadow-lg text-white" style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)" }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-1">Hostel Capacity</p>
            <h2 className="text-4xl font-black">250</h2>
            <p className="text-[10px] text-blue-100 font-bold mt-2">🏢 Available: {250 - assignedCount} Beds</p>
          </div>
        </div>

        {/* 3. SEARCH & DYNAMIC FILTERS */}
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border-2 border-indigo-100 shadow-md mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 text-base">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or entry number"
                className="w-full pl-12 pr-4 py-3.5 bg-indigo-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:border-indigo-400 focus:bg-white focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Room Number Search */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 text-xs">🚪</span>
                <input
                  type="text"
                  placeholder="Room no."
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="pl-9 pr-4 py-3.5 bg-violet-50 border-2 border-transparent rounded-2xl text-[10px] font-black uppercase w-28 focus:border-violet-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="bg-emerald-50 border-2 border-transparent rounded-2xl text-[10px] font-black uppercase px-5 py-3.5 focus:border-emerald-400 focus:outline-none cursor-pointer text-emerald-700 transition-all"
              >
                <option value="All">All Floors</option>
                {availableFloors.map(f => (
                  <option key={f} value={String(f)}>
                    {f === "G" ? "Ground Floor" : `Floor ${f}`}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-amber-50 border-2 border-transparent rounded-2xl text-[10px] font-black uppercase px-5 py-3.5 focus:border-amber-400 focus:outline-none cursor-pointer text-amber-700 transition-all"
              >
                <option value="All">All Status</option>
                <option value="Assigned">Assigned</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. MASTER STUDENT TABLE */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden">
          {/* Table header bar */}
          <div className="px-8 py-4 flex items-center justify-between border-b-2 border-slate-100" style={{ background: "linear-gradient(90deg, #f8faff, #f3f0ff)" }}>
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">
              Student Directory
              <span className="ml-3 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold normal-case tracking-normal">
                {filteredStudents.length} shown
              </span>
            </h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hover room to edit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }}>
                  <th className="px-8 py-4 text-[10px] font-black text-indigo-100 uppercase tracking-widest">Resident Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-100 uppercase tracking-widest">Identification</th>
                  <th className="px-4 py-4 text-[10px] font-black text-indigo-100 uppercase tracking-widest text-center">Floor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-100 uppercase tracking-widest text-center">Room Number</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-100 uppercase tracking-widest">Contact Info</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <tr
                      key={student._id}
                      className="border-b border-slate-100 hover:bg-indigo-50/40 transition-colors group"
                      style={idx % 2 === 0 ? { background: "#fafbff" } : { background: "#ffffff" }}
                    >
                      {/* Name & Degree */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md shrink-0"
                            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">{student.name}</p>
                            <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest bg-violet-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                              {student.degreeType || "B.Tech"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Entry Number */}
                      <td className="px-6 py-5 font-mono">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Entry No.</p>
                        <span className="bg-slate-800 text-slate-100 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter">
                          {student.entryNumber || "N/A"}
                        </span>
                      </td>

                      {/* Floor */}
                      <td className="px-4 py-5 text-center">
                        {student.floorNumber ? (
                          <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl inline-block"
                            style={{ background: student.floorNumber === 'G' ? "#d1fae5" : "#ede9fe", color: student.floorNumber === 'G' ? "#065f46" : "#5b21b6" }}>
                            {student.floorNumber === 'G' ? 'Ground Floor' : `Floor ${student.floorNumber}`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 uppercase px-3 py-1.5 bg-slate-100 rounded-xl inline-block">N/A</span>
                        )}
                      </td>

                      {/* Room Number — editable */}
                      <td className="px-6 py-5 text-center">
                        {editingStudentId === student._id ? (
                          <div className="flex flex-col items-center gap-2">
                            <input
                              type="text"
                              value={editRoomValue}
                              onChange={(e) => setEditRoomValue(e.target.value)}
                              className="w-20 px-2 py-1.5 text-center text-sm border-2 border-indigo-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                              placeholder="Room"
                              autoFocus
                            />
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSaveRoom(student._id)}
                                disabled={savingRoom}
                                className="text-[10px] font-bold text-white px-3 py-1 rounded-lg disabled:opacity-50 transition"
                                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                              >
                                {savingRoom ? "..." : "Save"}
                              </button>
                              <button
                                onClick={() => setEditingStudentId(null)}
                                disabled={savingRoom}
                                className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative inline-block">
                            {student.roomNumber ? (
                              <div className="inline-block px-4 py-2 rounded-2xl font-black text-sm text-indigo-700 border-2 border-indigo-200 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200">
                                {student.roomNumber}
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-rose-600 uppercase px-3 py-1.5 bg-rose-50 rounded-xl border-2 border-rose-200 inline-block">
                                Not Assigned
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingStudentId(student._id);
                                setEditRoomValue(student.roomNumber || "");
                              }}
                              className="absolute -right-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-1 rounded-md shadow-md text-[10px]"
                              title="Edit Room"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <span className="text-indigo-400">📧</span> {student.email}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                            <span>📞</span> {student.phone || "No Phone"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-5xl">🔍</span>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No residents found matching filters</p>
                      </div>
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