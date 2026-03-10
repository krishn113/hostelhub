"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import NoticeForm from "@/components/NoticeForm";

export default function NoticeDashboard() {
  const [notices, setNotices] = useState([]);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

    // Analysis Calculations
  const stats = useMemo(() => ({
    total: notices.length,
    urgent: notices.filter(n => n.category === "Urgent").length,
    pinned: notices.filter(n => n.isPinned).length,
    recent: notices.filter(n => (new Date() - new Date(n.createdAt)) / 36e5 < 24).length
  }), [notices]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await API.get("/notices");
      setNotices(res.data);
    } catch (err) {
      console.error("Failed to fetch", err);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await API.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  const handlePinNotice = async (id, currentPin) => {
    try {
      await API.patch(`/notices/${id}`, { isPinned: !currentPin });
      fetchNotices();
    } catch (err) { alert("Pinning failed"); }
  };

  const handleCreateNotice = async () => {
  try {
    const token = localStorage.getItem("token");

    await API.post(
      "/notices",
      {
        title,
        content,
        category
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchNotices();
    setIsModalOpen(false);

  } catch (err) {
    console.error(err);
    alert("Failed to create notice");
  }
};

  return (
    <DashboardLayout role="warden">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        
        {/* 1. BROADCAST ANALYSIS SECTION */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Notice Board</h1>
              <p className="text-slate-500 font-medium">Broadcast announcements and pin critical updates.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              <span>➕</span> Create New Notice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm transition hover:shadow-md">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Notices</p>
              <h3 className="text-2xl font-black text-slate-800">{stats.total}</h3>
              <div className="h-1 w-12 bg-indigo-500 rounded-full mt-2" />
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm transition hover:shadow-md">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Urgent Alerts</p>
              <h3 className="text-2xl font-black text-red-500">{stats.urgent}</h3>
              <div className="h-1 w-12 bg-red-500 rounded-full mt-2" />
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm transition hover:shadow-md">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pinned Items</p>
              <h3 className="text-2xl font-black text-amber-500">{stats.pinned}</h3>
              <div className="h-1 w-12 bg-amber-500 rounded-full mt-2" />
            </div>
            <div className="bg-indigo-900 p-5 rounded-[2rem] shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Last 24 Hours</p>
                <h3 className="text-2xl font-black text-white">{stats.recent} New</h3>
              </div>
              <div className="absolute -right-2 -bottom-2 text-white opacity-5 text-6xl group-hover:scale-125 transition duration-500">📢</div>
            </div>
          </div>
        </header>

        {/* 2. SEARCH & CATEGORY FILTER */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white p-3 rounded-[1.8rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                placeholder="Search notices..." 
                className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 text-sm focus:ring-2 focus:ring-indigo-500 transition"
                onChange={(e) => setNoticeSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["All", "Urgent", "Events", "Academic", "Maintenance"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                    activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. NOTICE FEED */}
        <div className="max-w-4xl mx-auto space-y-4 pb-20">
          {notices
            .sort((a, b) => (b.isPinned - a.isPinned) || new Date(b.createdAt) - new Date(a.createdAt))
            .filter(n => (activeCategory === "All" || n.category === activeCategory) && n.title.toLowerCase().includes(noticeSearch.toLowerCase()))
            .map((notice) => (
              <div key={notice._id} className={`group bg-white rounded-[2.5rem] p-8 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${notice.isPinned ? 'border-amber-200 ring-2 ring-amber-500/5 bg-amber-50/10' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                        notice.category === 'Urgent' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 
                        notice.category === 'Academic' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' :
                        notice.category === 'Maintenance' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' :
                        'bg-slate-800 text-white shadow-lg shadow-slate-100'
                      }`}>
                        {notice.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                      {notice.isPinned && (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-lg">
                          PINNED 📍
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                      {notice.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium opacity-80">
                      {notice.content}
                    </p>
                  </div>
                  
                  {/* TOOLBOX: PIN & DELETE */}
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => handlePinNotice(notice._id, notice.isPinned)}
                      className={`p-3 rounded-2xl border transition shadow-sm ${notice.isPinned ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'}`}
                      title={notice.isPinned ? "Unpin Notice" : "Pin Notice"}
                    >
                      📌
                    </button>
                    <button 
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition shadow-sm"
                      title="Delete Notice"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-bold text-xs text-slate-500">
                      C
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office of Caretaker</span>
                  </div>
                  {((notice.attachments && notice.attachments.length > 0) || (notice.links && notice.links.length > 0)) && (
                    <button 
                      onClick={() => setExpandedNoticeId(expandedNoticeId === notice._id ? null : notice._id)}
                      className="text-indigo-600 text-[10px] font-black uppercase hover:underline tracking-widest"
                    >
                      {expandedNoticeId === notice._id ? 'Hide Attachments ↑' : 'View Attachments →'}
                    </button>
                  )}
                </div>

                {/* Attachments & Links Dropdown */}
                {expandedNoticeId === notice._id && ((notice.attachments && notice.attachments.length > 0) || (notice.links && notice.links.length > 0)) && (
                  <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 bg-slate-50/50 p-4 rounded-2xl">
                    {notice.attachments && notice.attachments.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Files</h4>
                        <div className="flex flex-wrap gap-2">
                          {notice.attachments.map((file, idx) => (
                            <a 
                              key={idx} 
                              href={`http://localhost:5000${file.url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-white border border-slate-200 text-indigo-700 px-3 py-2 rounded-xl text-xs font-bold hover:border-indigo-300 hover:shadow-sm transition"
                            >
                              📄 {file.fileName || 'Attachment'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {notice.links && notice.links.length > 0 && (
                      <div>
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">External Links</h4>
                         <div className="flex flex-col gap-2">
                           {notice.links.map((link, idx) => (
                             <a 
                               key={idx} 
                               href={link.url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
                             >
                               🔗 {link.label || link.url}
                             </a>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

          {notices.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-400 font-black uppercase tracking-widest">The board is currently empty</p>
            </div>
          )}
        </div>
      </div>
      <NoticeForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchNotices} 
      />

    </DashboardLayout>
  );
}