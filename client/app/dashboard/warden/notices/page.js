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

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Urgent':
        return {
          bg: 'bg-rose-50/50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-500 text-white shadow-lg shadow-rose-100',
          accent: 'bg-rose-400'
        };
      case 'Academic':
        return {
          bg: 'bg-blue-50/50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-500 text-white shadow-lg shadow-blue-100',
          accent: 'bg-blue-400'
        };
      case 'Maintenance':
        return {
          bg: 'bg-amber-50/50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-500 text-white shadow-lg shadow-amber-100',
          accent: 'bg-amber-400'
        };
      case 'Events':
        return {
          bg: 'bg-emerald-50/50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100',
          accent: 'bg-emerald-400'
        };
      default:
        return {
          bg: 'bg-slate-50/50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          badge: 'bg-slate-800 text-white shadow-lg shadow-slate-100',
          accent: 'bg-slate-400'
        };
    }
  };

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
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
        
        {/* 1. BROADCAST ANALYSIS SECTION */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Notice Board</h1>
              <p className="text-slate-500 font-medium mt-2">Broadcast announcements and pin critical updates.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 group hover:-translate-y-1"
            >
              <span className="group-hover:rotate-90 transition-transform duration-500">➕</span> Create Notice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-200 shadow-sm transition hover:shadow-xl duration-500 relative overflow-hidden group">
               <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 relative z-10">Live Notices</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">{stats.total}</h3>
              <div className="h-1.5 w-12 bg-blue-400 rounded-full mt-3 relative z-10" />
            </div>

            <div className="bg-rose-50/50 p-6 rounded-[2.5rem] border border-rose-200 shadow-sm transition hover:shadow-xl duration-500 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-rose-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 relative z-10">Urgent Alerts</p>
              <h3 className="text-4xl font-black text-rose-600 tracking-tighter relative z-10">{stats.urgent}</h3>
              <div className="h-1.5 w-12 bg-rose-400 rounded-full mt-3 relative z-10" />
            </div>

            <div className="bg-amber-50/50 p-6 rounded-[2.5rem] border border-amber-200 shadow-sm transition hover:shadow-xl duration-500 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 relative z-10">Pinned Items</p>
              <h3 className="text-4xl font-black text-amber-600 tracking-tighter relative z-10">{stats.pinned}</h3>
              <div className="h-1.5 w-12 bg-amber-400 rounded-full mt-3 relative z-10" />
            </div>

            <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 relative overflow-hidden group transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Last 24 Hours</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{stats.recent} New</h3>
              </div>
              <div className="absolute -right-4 -bottom-4 text-white opacity-20 text-7xl group-hover:scale-125 transition duration-700 rotate-12">📢</div>
            </div>
          </div>
        </header>

        {/* 2. SEARCH & CATEGORY FILTER */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-4 rounded-[3rem] border-2 border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search notices..." 
                className="w-full bg-slate-50 border-none rounded-[1.8rem] py-4 pl-12 text-sm focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                onChange={(e) => setNoticeSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide px-2">
              {["All", "Urgent", "Events", "Academic", "Maintenance"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          {notices
            .sort((a, b) => (b.isPinned - a.isPinned) || new Date(b.createdAt) - new Date(a.createdAt))
            .filter(n => (activeCategory === "All" || n.category === activeCategory) && n.title.toLowerCase().includes(noticeSearch.toLowerCase()))
            .map((notice) => {
              const styles = getCategoryStyles(notice.category);
              return (
              <div key={notice._id} className={`group bg-white rounded-[3.5rem] p-8 md:p-12 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden ${notice.isPinned ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`}>
                
                <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${styles.accent}`} />
                
                <div className="flex justify-between items-start gap-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border shadow-sm ${styles.badge}`}>
                        {notice.category}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(notice.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {notice.isPinned && (
                        <span className="flex items-center gap-2 bg-amber-50 text-amber-700 text-[10px] font-black px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
                          PINNED 📍
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors tracking-tight">
                      {notice.title}
                    </h2>
                    <p className="text-slate-500 text-base leading-relaxed mb-8 font-medium border-l-4 border-slate-100 pl-4">
                      {notice.content}
                    </p>
                  </div>
                  
                  {/* TOOLBOX: PIN & DELETE */}
                  <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-500">
                    <button 
                      onClick={() => handlePinNotice(notice._id, notice.isPinned)}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition shadow-sm ${notice.isPinned ? 'bg-amber-500 border-amber-500 text-white shadow-amber-100' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50'}`}
                      title={notice.isPinned ? "Unpin Notice" : "Pin Notice"}
                    >
                      📍
                    </button>
                    <button 
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition shadow-sm"
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
            );
          })}

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