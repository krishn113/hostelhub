"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Plus, X, Search, Phone, CheckCircle2, AlertCircle, Package, Clock, Image as ImageIcon, Camera } from "lucide-react";

export default function LostFoundPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("lost");
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [profilePhone, setProfilePhone] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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

  
  useEffect(() => {
    if (user && !user.roomNumber) {
      router.replace("/dashboard/student");
    }
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/me");
      const phone = res.data.phone || "";
      setProfilePhone(phone);
      setCurrentUserId(res.data._id);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("visibility", form.visibility);
      formData.append("contactNumber", form.contactNumber);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await API.post("/student/lost-found", formData);

      // Reset form but keep prefetched phone
      setForm({
        title: "",
        description: "",
        type: "lost",
        visibility: "global",
        contactNumber: profilePhone,
      });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.log(err);
    } finally {
      setIsUploading(false);
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
    .filter((p) => p.status !== "resolved")
    .filter((p) => {
      if (activeTab === "mine") return p.postedBy?._id === currentUserId;
      return p.type === activeTab;
    })
    .filter((p) =>
      searchQuery
        ? p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter((p) => {
      if (!dateFilter) return true;
      const postDate = new Date(p.createdAt);
      const filterDate = new Date(dateFilter);
      // We want items posted ON or AFTER the selected date
      // Reset hours to compare only the dates
      postDate.setHours(0, 0, 0, 0);
      filterDate.setHours(0, 0, 0, 0);
      return postDate >= filterDate;
    });

  const lostCount = posts.filter((p) => p.type === "lost" && p.status !== "resolved").length;
  const foundCount = posts.filter((p) => p.type === "found" && p.status !== "resolved").length;
  const myPostsCount = posts.filter((p) => p.postedBy?._id === currentUserId && p.status !== "resolved").length;

  if (!user) return <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">Loading...</div>;
  if (!user.roomNumber) return null;
 
  return (
    <DashboardLayout role="student" activeTab="lost-found">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Lost & Found</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Report lost items or help others find theirs
          </p>
        </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"} w-full sm:w-auto justify-center text-white px-8 py-4 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group`}
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
          <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border-2 border-indigo-50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-black text-slate-900 mb-4 sm:mb-6">Post an Item</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Toggle */}
              <div className="flex gap-2 sm:gap-3">
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
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm mt-1 h-[140px] resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Describe the item, where you lost/found it..."
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  
                  {/* IMAGE UPLOAD SECTION */}
                  <div className="mt-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest block mb-2">
                       Item Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                       {imagePreview ? (
                         <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-sm group">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => { setImageFile(null); setImagePreview(null); }}
                              className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                               <X size={16} />
                            </button>
                         </div>
                       ) : (
                         <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-500 group">
                            <Camera size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Choose Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                         </label>
                       )}
                       <p className="text-[10px] text-slate-400 italic flex-1">
                          Adding a photo helps people identify the item much faster. Max size 5MB.
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className={`w-full ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all`}
              >
                {isUploading ? "Uploading..." : "Submit Post"}
              </button>
            </form>
          </div>
        )}

        {/* TABS + SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("lost")}
              className={`flex-1 sm:flex-none flex items-center justify-center min-w-[90px] sm:min-w-0 gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
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
              className={`flex-1 sm:flex-none flex items-center justify-center min-w-[90px] sm:min-w-0 gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
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
            <button
              onClick={() => setActiveTab("mine")}
              className={`flex-1 sm:flex-none flex items-center justify-center min-w-[90px] sm:min-w-0 gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${
                activeTab === "mine"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Package size={14} />
              My Posts
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "mine"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {myPostsCount}
              </span>
            </button>
          </div>

          {/* Right: My Posts filter + Search + Date Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Date Filter */}
            <div className={`flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 bg-slate-100 px-4 py-2 rounded-2xl border-2 transition-all duration-300 ${dateFilter ? 'border-indigo-400 bg-white shadow-sm' : 'border-transparent'}`}>
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">After:</span>
               <input 
                 type="date"
                 value={dateFilter}
                 onChange={(e) => setDateFilter(e.target.value)}
                 className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer w-28"
               />
               {dateFilter && (
                 <button onClick={() => setDateFilter("")} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                    <X size={14} strokeWidth={3} />
                 </button>
               )}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-100 border-none rounded-2xl py-3 pl-10 pr-5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* POSTS LIST */}
        <div className="grid gap-5">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold text-lg">No {activeTab === "mine" ? "personal" : activeTab} items posted yet</p>
              <p className="text-slate-300 text-sm mt-1">{activeTab === "mine" ? "You haven't posted any items" : "Be the first to post something"}</p>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 px-5 sm:px-8 py-5 sm:py-6 ml-1 sm:ml-3 relative z-10">
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    {/* Icon */}
                    <div
                      className={`p-3 sm:p-4 rounded-2xl sm:rounded-[1.5rem] shrink-0 border shadow-sm ${
                        p.type === "lost" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                      }`}
                    >
                      {p.type === "lost" ? <AlertCircle size={20} className="sm:w-6 sm:h-6" /> : <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />}
                    </div>

                    {/* Title + contact + posted by */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                        {p.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-1.5">
                        {p.contactNumber && (
                          <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-slate-500 font-bold bg-slate-50 px-2.5 sm:px-3 py-1 rounded-full border border-slate-100">
                            <Phone size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                            {p.contactNumber}
                          </span>
                        )}
                        {activeTab !== "mine" && (
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">
                            By <span className="text-slate-800">{p.postedBy?.name?.split(' ')[0]}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                      onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
                      className="flex-1 flex justify-center items-center text-indigo-600 hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border border-indigo-100 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300"
                    >
                      {expandedId === p._id ? "Hide" : "Details"}
                    </button>
                    {p.postedBy?._id === currentUserId && (
                      <button
                        onClick={() => markResolved(p._id)}
                        className="flex-1 flex justify-center items-center bg-slate-50 hover:bg-emerald-500 text-slate-400 hover:text-white border border-slate-100 hover:border-emerald-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === p._id && (
                  <div className="mx-4 sm:mx-7 mb-4 sm:mb-5 ml-4 sm:ml-10 p-4 sm:p-5 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-6">
                       {p.imageUrl && (
                         <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                         </div>
                       )}
                       <p className="text-slate-600 text-sm leading-relaxed flex-1">
                          {p.description}
                       </p>
                    </div>
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