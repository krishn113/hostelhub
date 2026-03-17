"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, X, Search, Phone, CheckCircle2, AlertCircle, Package, Clock } from "lucide-react";

export default function LostFoundPage() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("lost");
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [profilePhone, setProfilePhone] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    visibility: "global",
    contactNumber: "",
  });

  useEffect(() => {
    fetchPosts();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/me");
      const phone = res.data.phone || "";
      setProfilePhone(phone);
      setForm((prev) => ({ ...prev, contactNumber: phone }));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get("/student/lost-found");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/student/lost-found", form);
      // Reset form but keep prefetched phone
      setForm({
        title: "",
        description: "",
        type: "lost",
        visibility: "global",
        contactNumber: profilePhone,
      });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const markResolved = async (id) => {
    try {
      await API.put(`/student/lost-found/${id}/resolve`);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredPosts = posts
    .filter((p) => p.type === activeTab && p.status !== "resolved")
    .filter((p) =>
      searchQuery
        ? p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const lostCount = posts.filter((p) => p.type === "lost" && p.status !== "resolved").length;
  const foundCount = posts.filter((p) => p.type === "found" && p.status !== "resolved").length;

  return (
    <DashboardLayout role="student" activeTab="lost-found">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">

        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Lost & Found</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Report lost items or help others find theirs
          </p>
        </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white px-8 py-4 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group`}
          >
            {showForm ? (
              <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            ) : (
              <>
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="font-black uppercase text-[10px] tracking-[0.15em]">Post Item</span>
              </>
            )}
          </button>
        </div>

        {/* POST FORM */}
        {showForm && (
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-black text-slate-900 mb-6">Post an Item</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Toggle */}
              <div className="flex gap-3">
                {["lost", "found"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      form.type === t
                        ? t === "lost"
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                          : "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                      Item Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g., Blue water bottle"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Your contact number"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                      Visibility
                    </label>
                    <select
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                      value={form.visibility}
                      onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                    >
                      <option value="global">All Students</option>
                      <option value="hostel">Only My Hostel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                    Description
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 h-[168px] resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Describe the item, where you lost/found it..."
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Submit Post
              </button>
            </form>
          </div>
        )}

        {/* TABS + SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab("lost")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "lost"
                  ? "bg-white text-rose-500 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <AlertCircle size={14} />
              Lost
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "lost" ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"
                }`}
              >
                {lostCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("found")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "found"
                  ? "bg-white text-emerald-500 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <CheckCircle2 size={14} />
              Found
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "found"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {foundCount}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-100 border-none rounded-2xl py-3 pl-10 pr-5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
        </div>

        {/* POSTS LIST */}
        <div className="grid gap-5">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold text-lg">No {activeTab} items posted yet</p>
              <p className="text-slate-300 text-sm mt-1">Be the first to post something</p>
            </div>
          ) : (
            filteredPosts.map((p) => (
              <div
                key={p._id}
                className={`bg-white rounded-[2.5rem] border shadow-sm relative overflow-hidden transition-all hover:shadow-md ${
                  p.type === "lost" ? "border-rose-50" : "border-emerald-50"
                }`}
              >
                {/* Color accent strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    p.type === "lost" ? "bg-rose-400" : "bg-emerald-400"
                  }`}
                />

                {/* Main row — always visible */}
                <div className="flex items-center gap-6 px-8 py-6 ml-3 relative z-10">
                  {/* Icon */}
                  <div
                    className={`p-4 rounded-[1.5rem] shrink-0 border shadow-sm ${
                      p.type === "lost" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                    }`}
                  >
                    {p.type === "lost" ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                  </div>

                  {/* Title + contact + posted by */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                      {p.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-1.5">
                      {p.contactNumber && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          <Phone size={12} className="text-slate-400" />
                          {p.contactNumber}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">
                        By <span className="text-slate-800">{p.postedBy?.name?.split(' ')[0]}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                      className="text-indigo-600 hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border border-indigo-100 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300"
                    >
                      {expandedId === p._id ? "Hide" : "Details"}
                    </button>
                    <button
                      onClick={() => markResolved(p._id)}
                      className="bg-slate-50 hover:bg-emerald-500 text-slate-400 hover:text-white border border-slate-100 hover:border-emerald-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100"
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === p._id && (
                  <div className="mx-7 mb-5 ml-10 p-5 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-white rounded-full border border-slate-100">
                        {p.visibility === "global" ? "Global" : "Hostel only"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium px-3 py-1 bg-white rounded-full border border-slate-100">
                        {new Date(p.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {(() => {
                        const days = getDaysLeft(p.expiresAt);
                        if (days === null) return null;
                        return (
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full ${
                            days <= 7 ? "bg-amber-50 text-amber-500" : "bg-white text-slate-400 border border-slate-100"
                          }`}>
                            <Clock size={10} /> {days}d left
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}