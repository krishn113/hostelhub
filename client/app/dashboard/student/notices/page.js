"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { 
  Bell, Search, Info, TriangleAlert, CalendarDays, 
  Pin, RotateCcw, Filter, Megaphone, Zap, CheckCircle2, EyeOff, ChevronDown
} from "lucide-react";

const CATEGORIES = ["All", "Urgent", "Academic", "Maintenance", "Events", "Other"];

export default function StudentNoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [hostelData, setHostelData] = useState(null);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Persistence for read notices
  const [readNotices, setReadNotices] = useState([]);

  useEffect(() => {
    // Load read notices from local storage on mount
    const saved = localStorage.getItem(`read_notices_${user?._id}`);
    if (saved) setReadNotices(JSON.parse(saved));
    
    if (user?.year && user?.gender && user?.degreeType) {
      resolveHostelAndFetchNotices();
    }
  }, [user]);

  const resolveHostelAndFetchNotices = async () => {
    try {
      setLoading(true);
      const allocationRes = await API.get(`/allocations/find`, {
        params: { year: user.year, gender: user.gender, degreeType: user.degreeType }
      });

      if (allocationRes.data?.hostelId) {
        const hostelObj = allocationRes.data.hostelId;
        const hId = hostelObj._id || hostelObj;
        setHostelData(hostelObj);
        const noticeRes = await API.get(`/notices`, { params: { hostel: hId } });
        setNotices(noticeRes.data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMarkAsRead = (id) => {
    const updated = readNotices.includes(id) 
      ? readNotices.filter(itemId => itemId !== id)
      : [...readNotices, id];
    
    setReadNotices(updated);
    localStorage.setItem(`read_notices_${user?._id}`, JSON.stringify(updated));
  };

  const filteredNotices = useMemo(() => {
    return notices
      .sort((a, b) => (b.isPinned - a.isPinned) || new Date(b.createdAt) - new Date(a.createdAt))
      .filter(n => (activeCategory === "All" || n.category === activeCategory) && 
                   n.title.toLowerCase().includes(noticeSearch.toLowerCase()));
  }, [notices, activeCategory, noticeSearch]);

  const stats = {
    total: notices.length,
    urgent: notices.filter(n => n.category === "Urgent").length,
    pinned: notices.filter(n => n.isPinned).length,
    new: notices.filter(n => {
      const yesterday = new Date(Date.now() - 86400000);
      return new Date(n.createdAt) > yesterday && !readNotices.includes(n._id);
    }).length
  };

 const getCategoryStyles = (cat) => {
  switch (cat) {
    case 'Urgent': return 'bg-rose-50/80 border-rose-100 text-rose-700';
    case 'Maintenance': return 'bg-amber-50/80 border-amber-100 text-amber-700';
    case 'Academic': return 'bg-indigo-50/80 border-indigo-100 text-indigo-700';
    case 'Events': return 'bg-emerald-50/80 border-emerald-100 text-emerald-700';
    default: return 'bg-slate-50 border-slate-200 text-slate-700';
  }
};

  return (
    <DashboardLayout role="student" activeTab="notices">
      <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Notice Board</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Official updates for <span className="text-indigo-600">{hostelData?.name || "Your Hostel"}</span>
            </p>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Live Notices", val: stats.total, color: "bg-indigo-600", icon: Megaphone },
            { label: "Urgent Alerts", val: stats.urgent, color: "bg-rose-500", icon: Zap },
            { label: "Pinned Items", val: stats.pinned, color: "bg-amber-500", icon: Pin },
            { label: "Unread Updates", val: stats.new, color: "bg-slate-900", icon: Bell, dark: true }
          ].map((s, i) => (
            <div key={i} className={`p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all ${s.dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                <s.icon size={14} className={s.dark ? 'text-indigo-400' : 'text-indigo-500'} />
              </div>
              <p className="text-3xl font-black tracking-tighter">{s.val}</p>
              <div className={`h-1 w-8 mt-3 rounded-full ${s.color}`} />
            </div>
          ))}
        </div>

        {/* SEARCH & FILTERS */}

<div className="flex flex-col md:flex-row items-center gap-4 w-full">
  {/* Search Bar Container */}
  <div className="relative flex-1 w-full">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
    <input 
      type="text" 
      placeholder="Search notices..." 
      className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
      value={noticeSearch} 
      onChange={(e) => setNoticeSearch(e.target.value)}
    />
  </div>

  {/* Filter & Clear Container */}
  <div className="flex items-center gap-2 w-full md:w-auto">
    <div className="relative flex-1 md:flex-none">
      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
      <select 
        className="w-full md:w-48 bg-white border border-slate-100 rounded-2xl py-3 pl-10 pr-10 text-[11px] font-black uppercase tracking-wider appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm cursor-pointer transition-all"
        value={activeCategory} 
        onChange={(e) => setActiveCategory(e.target.value)}
      >
        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      {/* Custom Chevron for Select */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={14} />
      </div>
    </div>

    {(noticeSearch || activeCategory !== "All") && (
      <button 
        onClick={() => {setNoticeSearch(""); setActiveCategory("All");}} 
        className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-100 transition-all flex items-center gap-2 border border-indigo-100 shadow-sm"
      >
        <RotateCcw size={16} />
        <span className="text-[10px] font-black uppercase hidden sm:inline">Clear</span>
      </button>
    )}
  </div>
</div>

        {/* NOTICES LIST */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const isRead = readNotices.includes(notice._id);
            return (
              <div 
                key={notice._id} 
                className={`bg-white rounded-[2.5rem] p-8 border-l-8 border-t border-r border-b border-slate-100 shadow-sm relative transition-all ${getCategoryStyles(notice.category)} ${isRead ? 'opacity-40 grayscale-[0.5]' : 'hover:shadow-md'}`}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black px-2.5 py-1 rounded-lg bg-white/50 uppercase tracking-widest border border-current">
                          {notice.category}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          <CalendarDays size={12} /> {new Date(notice.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {notice.isPinned && (
                          <span className="bg-amber-500 text-white text-[8px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Pin size={10} /> PINNED
                          </span>
                        )}
                        <button 
                          onClick={() => toggleMarkAsRead(notice._id)}
                          className={`p-1.5 rounded-full transition-colors ${isRead ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-slate-500 bg-slate-50'}`}
                          title={isRead ? "Mark as unread" : "Mark as read"}
                        >
                          {isRead ? <CheckCircle2 size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none mb-3">{notice.title}</h2>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed border-l-2 border-slate-100 pl-4">{notice.content}</p>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 italic">IITR</div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Caretaker {hostelData?.name || "Your Hostel"} </span>
                      </div>
                      
                      {((notice.attachments?.length > 0) || (notice.links?.length > 0)) && (
                        <button 
                          onClick={() => setExpandedNoticeId(expandedNoticeId === notice._id ? null : notice._id)}
                          className="bg-slate-50 hover:bg-white text-slate-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 transition-all flex items-center gap-2"
                        >
                          {expandedNoticeId === notice._id ? 'Close' : 'View Attachments'} <Info size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ASSETS DROPDOWN */}
                  {expandedNoticeId === notice._id && (
                    <div className="lg:w-80 bg-white/50 p-5 rounded-[1.5rem] border border-slate-100 flex flex-col animate-in slide-in-from-right-4 duration-300">
                      <div className="space-y-6">
                        {notice.attachments?.length > 0 && (
                          <div>
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Attachments</h4>
                            <div className="grid gap-2">
                              {notice.attachments.map((file, idx) => (
                                <a key={idx} href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-white border border-slate-100 p-3 rounded-xl text-[10px] font-bold text-indigo-600 hover:border-indigo-200 shadow-sm">
                                  📄 {file.fileName || 'Document'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {notice.links?.length > 0 && (
                          <div>
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Resources</h4>
                            <div className="grid gap-2">
                              {notice.links.map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[10px] font-black text-slate-600 hover:text-indigo-600 bg-slate-50 p-3 rounded-xl transition">
                                  🔗 {link.label || 'External Link'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNotices.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <TriangleAlert className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No matching updates found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}