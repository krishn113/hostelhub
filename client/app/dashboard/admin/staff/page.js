"use client";
import { useState, useEffect } from "react";
import API from "@/lib/api";
import { Plus, Mail, User, Building } from "lucide-react";

export default function StaffManagement() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "warden",
    hostelId: "",
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await API.get("/admin/hostels");
      setHostels(res.data);
      if (res.data.length > 0)
        setForm((prev) => ({ ...prev, hostelId: res.data[0]._id }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.email || !form.name) return alert("Fill all fields");

      setLoading(true);
      await API.post("/admin/staff", form);

      alert("✅ Staff Created & Credentials Sent!");
      setForm({ ...form, name: "", email: "" });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Staff Management
          </h1>
          <p className="text-slate-500 font-medium italic">
            Create wardens & caretakers for hostels
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in duration-500">
        <div className="grid md:grid-cols-2 gap-6">

          {/* NAME */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Staff Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter staff name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                placeholder="warden@hostel.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* ROLE */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Role
            </label>
            <select
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="warden">Warden</option>
              <option value="caretaker">Caretaker</option>
            </select>
          </div>

          {/* HOSTEL */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              Assign Hostel
            </label>
            <div className="relative">
              <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-sm mt-1 focus:ring-2 focus:ring-indigo-500"
                value={form.hostelId}
                onChange={(e) =>
                  setForm({ ...form, hostelId: e.target.value })
                }
              >
                {hostels.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          <Plus size={18} />
          {loading ? "Creating..." : "Create Staff & Send Email"}
        </button>
      </div>
    </div>
  );
}
