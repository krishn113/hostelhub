"use client";
import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Building2, Plus, Pencil, Users, Trash2 } from "lucide-react";

export default function Allocations() {
  const [hostels, setHostels] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  

  const [ruleForm, setRuleForm] = useState({
    year: "2025",
    gender: "Male",
    degreeType: "B.Tech",
    hostelId: "",
  });

  const [studentForm, setStudentForm] = useState({
    email: "",
    hostelId: "",
    roomNumber: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const validHostel = hostels.find(h =>
      h.type === "Mixed" ||
      (ruleForm.gender === "Male" && h.type === "Boys") ||
      (ruleForm.gender === "Female" && h.type === "Girls")
    );

    if (validHostel) {
      setRuleForm(prev => ({ ...prev, hostelId: validHostel._id }));
    }
  }, [ruleForm.gender]);

  const fetchData = async () => {
    const [hRes, aRes] = await Promise.all([
      API.get("/admin/hostels"),
      API.get("/admin/allocations/batch"),
    ]);

    setHostels(hRes.data);
    setAllocations(aRes.data);

    if (hRes.data.length > 0) {
      setRuleForm(prev => ({ ...prev, hostelId: hRes.data[0]._id }));
      setStudentForm(prev => ({ ...prev, hostelId: hRes.data[0]._id }));
    }
  };

  const handleRuleSubmit = async () => {
    try {
      if (editingId) {
        await API.put(`/admin/allocations/batch/${editingId}`, ruleForm);
        alert("Rule Updated");
      } else {
        await API.post("/admin/allocations/batch", ruleForm);
        alert("Rule Created");
      }

      setEditingId(null);
      setShowEditModal(false);
      fetchData();

    } catch (err) {
    console.log(err.response?.data || err.message);
    alert("Update Failed");
  }
  };

  const startEdit = (rule) => {
    setEditingId(rule._id);

    setRuleForm({
      year: rule.year,
      gender: rule.gender,
      degreeType: rule.degreeType,
      hostelId: rule.hostelId._id,
    });

    setShowEditModal(true);
  };

  const handleDeleteRule = async (id) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await API.delete(`/admin/allocations/batch/${id}`);
      alert("Rule Deleted");
      fetchData();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Delete Failed");
    }
  };

  const handleStudentAllocate = async () => {
    try {
      await API.post("/admin/allocations/student", studentForm);
      alert("Student Allocated");
    } catch {
      alert("Failed");
    }
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-slate-900">
          Allocation Management
        </h1>
        <p className="text-slate-500 italic">
          Manage hostel batch rules and individual overrides
        </p>
      </div>

      {/* ================= RULE FORM ================= */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Building2 size={18} /> Batch Allocation Rule
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <input
            className="bg-slate-50 p-3 rounded-xl"
            placeholder="Year"
            value={ruleForm.year}
            onChange={e => setRuleForm({ ...ruleForm, year: e.target.value })}
          />

          <select
            className="bg-slate-50 p-3 rounded-xl"
            value={ruleForm.degreeType}
            onChange={e => setRuleForm({ ...ruleForm, degreeType: e.target.value })}
          >
            {["B.Tech","M.Tech","PhD","MSc","All"].map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            className="bg-slate-50 p-3 rounded-xl"
            value={ruleForm.gender}
            onChange={e => setRuleForm({ ...ruleForm, gender: e.target.value })}
          >
            <option>Male</option>
            <option>Female</option>
          </select>

          <select
            className="bg-slate-50 p-3 rounded-xl"
            value={ruleForm.hostelId}
            onChange={e => setRuleForm({ ...ruleForm, hostelId: e.target.value })}
          >
            {hostels.map(h => {

              const disabled =
                (ruleForm.gender === "Male" && h.type === "Girls") ||
                (ruleForm.gender === "Female" && h.type === "Boys");

              return (
                <option
                  key={h._id}
                  value={h._id}
                  disabled={disabled}
                >
                  {h.name} ({h.type})
                </option>
              );
            })}
          </select>
        </div>

        <button
          onClick={handleRuleSubmit}
          className="mt-5 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:-translate-y-1 transition"
        >
          <Plus size={16}/> {editingId ? "Update Rule" : "Add Rule"}
        </button>
      </div>

      {/* ================= HOSTEL-WISE RULES ================= */}
      <div className="space-y-6">
        {hostels.map(hostel => (
          <div key={hostel._id} className="bg-white rounded-[2rem] p-6 border shadow-sm">

      <div className="flex items-center justify-between mb-4">

        <h3 className="font-bold text-lg text-indigo-700 flex items-center gap-2">
          <Building2 size={18}/> {hostel.name}
        </h3>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full
            ${hostel.type === "Boys" ? "bg-blue-100 text-blue-700" : ""}
            ${hostel.type === "Girls" ? "bg-pink-100 text-pink-700" : ""}
            ${hostel.type === "Mixed" ? "bg-purple-100 text-purple-700" : ""}
          `}
        >
          TYPE: {hostel.type}
        </span>

      </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allocations
                .filter(a => a.hostelId?._id === hostel._id)
                .map(rule => (
                  <div key={rule._id}
                    className="p-5 bg-slate-50 rounded-2xl border hover:shadow-md transition">

                    <p className="font-bold text-slate-800">
                      {rule.year} • {rule.degreeType}
                    </p>
                    <p className="text-sm text-slate-500">
                      Gender: {rule.gender}
                    </p>

                    <div className="flex gap-3 mt-3">

                      <button
                        onClick={() => startEdit(rule)}
                        className="flex items-center gap-1 text-indigo-600 text-xs font-bold"
                      >
                        <Pencil size={14}/> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule._id)}
                        className="flex items-center gap-1 text-red-600 text-xs font-bold"
                      >
                        <Trash2 size={14}/> Delete
                      </button>

                    </div>
                  </div>
                ))}
            </div>

          </div>
        ))}
      </div>

      {/* ================= INDIVIDUAL ================= */}
      <div className="bg-white rounded-[2rem] p-6 border shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Users size={18}/> Individual Student Override
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            className="bg-slate-50 p-3 rounded-xl"
            placeholder="Student Email"
            value={studentForm.email}
            onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
          />

          <select
            className="bg-slate-50 p-3 rounded-xl"
            value={studentForm.hostelId}
            onChange={e => setStudentForm({ ...studentForm, hostelId: e.target.value })}
          >
            {hostels.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>

          <input
            className="bg-slate-50 p-3 rounded-xl"
            placeholder="Room Number"
            value={studentForm.roomNumber}
            onChange={e => setStudentForm({ ...studentForm, roomNumber: e.target.value })}
          />
        </div>

        <button
          onClick={handleStudentAllocate}
          className="mt-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:-translate-y-1 transition"
        >
          Allocate Student
        </button>
      </div>
    {showEditModal && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">

      <h2 className="text-lg font-bold mb-4">
        Edit Allocation Rule
      </h2>

      <div className="space-y-3">

        <input
          className="w-full bg-slate-50 p-3 rounded-xl"
          value={ruleForm.year}
          onChange={e => setRuleForm({ ...ruleForm, year: e.target.value })}
        />

        <select
          className="w-full bg-slate-50 p-3 rounded-xl"
          value={ruleForm.degreeType}
          onChange={e => setRuleForm({ ...ruleForm, degreeType: e.target.value })}
        >
          {["B.Tech","M.Tech","PhD","MSc","All"].map(d => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select
          className="w-full bg-slate-50 p-3 rounded-xl"
          value={ruleForm.gender}
          onChange={e => setRuleForm({ ...ruleForm, gender: e.target.value })}
        >
          <option>Male</option>
          <option>Female</option>
        </select>

        <select
          className="w-full bg-slate-50 p-3 rounded-xl"
          value={ruleForm.hostelId}
          onChange={e => setRuleForm({ ...ruleForm, hostelId: e.target.value })}
        >
          {hostels.map(h => {

            const disabled =
              (ruleForm.gender === "Male" && h.type === "Girls") ||
              (ruleForm.gender === "Female" && h.type === "Boys");

            return (
              <option key={h._id} value={h._id} disabled={disabled}>
                {h.name} ({h.type})
              </option>
            );
          })}
        </select>

      </div>

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 rounded-xl bg-slate-200"
        >
          Cancel
        </button>

        <button
          onClick={handleRuleSubmit}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
        >
          Update Rule
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );
}
