"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Bell, Search, Info, TriangleAlert, CalendarDays, 
  Pin, RotateCcw, Filter, Megaphone, Zap, CheckCircle2, EyeOff, ChevronDown, CalendarRange
} from "lucide-react";

const CATEGORIES = ["All", "Academic", "Maintenance", "Events", "Other"];

export default function StudentNoticeBoard() {
  const { user } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  const [dateFilter, setDateFilter] = useState(""); // empty string means no date filter
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [hostelData, setHostelData] = useState(null);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [expandedContentId, setExpandedContentId] = useState(null);
  const [expandedAttachmentsId, setExpandedAttachmentsId] = useState(null);
  
  // Persistence for read notices
  const [readNotices, setReadNotices] = useState([]);

  useEffect(() => {
    if (user && !user.roomNumber) {
      router.replace("/dashboard/student");
    }
  }, [user, router]);

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
      .filter((n) => {
        // Category
        if (activeCategory !== "All" && n.category !== activeCategory) return false;

        // Search (title + content)
        const search = noticeSearch.toLowerCase();
        if (
          !n.title.toLowerCase().includes(search) &&
          !n.content.toLowerCase().includes(search)
        ) return false;

        // Pinned filter
        if (showPinnedOnly && !n.isPinned) return false;

        // Date filter (notices on and after selected date)
        if (dateFilter) {
          const filterDate = new Date(dateFilter);
          filterDate.setHours(0, 0, 0, 0);
          
          const createdDate = new Date(n.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          
          if (createdDate < filterDate) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          (b.isPinned - a.isPinned) ||
          new Date(b.createdAt) - new Date(a.createdAt)
      );
}, [notices, activeCategory, noticeSearch, dateFilter, showPinnedOnly]);

  const stats = {
    total: notices.length,
    urgent: notices.filter(n => n.category === "Urgent").length,
    pinned: notices.filter(n => n.isPinned).length,
    new: notices.filter(n => {
      const yesterday = new Date(Date.now() - 86400000);
      return new Date(n.createdAt) > yesterday && !readNotices.includes(n._id);
    }).length,
    weekly: notices.filter(n => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      return new Date(n.createdAt) > weekAgo;
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

  if (!user) return <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">Loading...</div>;
  if (!user.roomNumber) return null;

  return (
    <DashboardLayout role="student" activeTab="notices">
      <div className="max-w-6xl mx-auto space-y-6 pb-8 px-4 animate-in fade-in duration-700">
        
        {/* HEADER & STATS */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 w-full">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase mb-2 md:mb-0">Notice Board</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Pinned", val: stats.pinned, color: "text-amber-500", bg: "bg-amber-500/10", icon: Pin },
              { label: "This Week", val: stats.weekly, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CalendarRange },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-sm transition-all ${s.dark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-100'}`}>
                <div className={`p-2 rounded-xl flex items-center justify-center ${s.dark ? 'bg-slate-800' : s.bg}`}>
                  <s.icon size={16} className={s.dark ? 'text-indigo-400' : s.color} />
                </div>
                <div className="flex flex-col justify-center translate-y-[1px]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{s.label}</span>
                  <span className="text-xl font-black leading-none tracking-tighter">{s.val}</span>
                </div>
              </div>
            ))}
          </div>
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
                {/* DATE FILTER */}
  <input
    type="date"
    className="bg-white border border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold text-slate-600 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
  />
  <button
  onClick={() => setShowPinnedOnly(!showPinnedOnly)}
  className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase border shadow-sm transition ${
    showPinnedOnly
      ? "bg-amber-500 text-white border-amber-500"
      : "bg-white text-slate-600 border-slate-100"
  }`}
>
  <Pin size={12} className="inline mr-1" />
  Pinned
</button>

            {(noticeSearch || activeCategory !== "All" || dateFilter || showPinnedOnly) && (
              <button  
                onClick={() => {
                  setNoticeSearch("");
                  setActiveCategory("All");
                  setDateFilter("");
                  setShowPinnedOnly(false);
                }}
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
              className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md ${
                isRead ? "opacity-70" : ""
              }`}
            >
              <div className="flex flex-col gap-4">
                
                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3">
                  
                  {/* LEFT */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* CATEGORY BADGE */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getCategoryStyles(notice.category)}`}>
                        {notice.category}
                      </span>

                      {/* PIN */}
                      {notice.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Pin size={10} />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h2 className="text-base font-semibold text-slate-800 leading-snug">
                      {notice.title}
                    </h2>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2">
                      {/* DATE */}
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <CalendarDays size={12} />
                        {new Date(notice.createdAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    <button
                      onClick={() => toggleMarkAsRead(notice._id)}
                      className={`p-2 rounded-lg transition ${
                        isRead
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {isRead ? <CheckCircle2 size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="text-sm text-slate-600 leading-relaxed">
                  {expandedContentId === notice._id ? (
                    <p>{notice.content}</p>
                  ) : (
                    <p className="line-clamp-2">{notice.content}</p>
                  )}

                  {notice.content.length > 120 && (
                    <button
                      onClick={() =>
                        setExpandedContentId(
                          expandedContentId === notice._id ? null : notice._id
                        )
                      }
                      className="text-indigo-600 text-xs font-semibold mt-1 hover:underline"
                    >
                      {expandedContentId === notice._id ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Posted by{" "}
                    <span className="text-slate-600 font-medium">
                      {notice.author?.name || "Admin"}
                    </span>
                  </span>

                  {(notice.attachments?.length > 0 || notice.links?.length > 0) && (
                    <button
                      onClick={() =>
                        setExpandedAttachmentsId(
                          expandedAttachmentsId === notice._id ? null : notice._id
                        )
                      }
                      className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      Attachments <Info size={12} />
                    </button>
                  )}
                </div>

                {/* ATTACHMENTS */}
                {expandedAttachmentsId === notice._id && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    
                    {notice.attachments?.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url.startsWith("http") ? file.url : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "")}${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg font-medium"
                      >
                        📎 {file.fileName || "File"}
                      </a>
                    ))}

                    {notice.links?.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg font-medium"
                      >
                        🔗 {link.label || "Open"}
                      </a>
                    ))}
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