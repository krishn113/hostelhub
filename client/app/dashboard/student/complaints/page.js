"use client";
import { useState, useEffect, useMemo } from "react"; // Added useMemo import
import { Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import HubHeader from "@/components/complaints/HubHeader.jsx";
import TabSwitcher from "@/components/complaints/TabSwitcher.jsx";
import ComplaintGrid from "@/components/complaints/ComplaintGrid.jsx";
import ComplaintDetailModal from "@/components/complaints/ComplaintDetailModal.jsx";
import NewComplaintModal from "@/components/complaints/NewComplaintModal.jsx";
import API from "@/lib/api";

export default function StudentComplaintsPage() {
  const [activeTab, setActiveTab] = useState("Room");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Issues");
  const [selectedDate, setSelectedDate] = useState("");
  const [user, setUser] = useState(null);

  // --- DATA FETCHING ---
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await API.get("/complaints/my-complaints");
      setComplaints(response.data.complaints || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchComplaints();
  }, []);

  const updateComplaintInList = (complaintId, updatedFields) => {
    setComplaints((prev) =>
      prev.map((c) => (c._id === complaintId ? { ...c, ...updatedFields } : c))
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Issues");
    setSelectedDate("");
  };

  // --- FILTERING AND SORTING LOGIC ---
  const displayComplaints = useMemo(() => {
    // 1. First, Filter the list
    const filtered = complaints.filter((c) => {
      const matchesTab = c.type?.toLowerCase() === activeTab.toLowerCase();
      const matchesStatus = statusFilter === "All Issues" || c.status === statusFilter;
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !selectedDate || (() => {
          const complaintDate = new Date(c.createdAt).setHours(0, 0, 0, 0);
          const filterDate = new Date(selectedDate).setHours(0, 0, 0, 0);
          return complaintDate === filterDate;
        })();

      return matchesTab && matchesStatus && matchesSearch && matchesDate;
    });

    // 2. Then, Sort the filtered list
    return [...filtered].sort((a, b) => {
      const getPriority = (status) => {
        if (status === "Rejected") return 2;
        if (status === "Resolved") return 1;
        return 0; // Active ones come first
      };

      const priorityA = getPriority(a.status);
      const priorityB = getPriority(b.status);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If priorities match, sort by Urgency
      if (a.isUrgent !== b.isUrgent) {
        return a.isUrgent ? -1 : 1;
      }

      // Finally, sort by Date (Newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [complaints, activeTab, statusFilter, searchTerm, selectedDate]);

  return (
    <DashboardLayout role="student" activeTab="complaints">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-6 pb-20 min-h-screen">
        <HubHeader
          onNewClick={() => setIsNewModalOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onClear={handleClearFilters}
        />
        
        <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="transition-all duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-[#001D4C] rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                Syncing Hub...
              </p>
            </div>
          ) : displayComplaints.length > 0 ? (
            /* We pass the already filtered and sorted list to the grid */
            <ComplaintGrid
              complaints={displayComplaints}
              activeTab={activeTab}
              onCardClick={(complaint) => setSelectedComplaint(complaint)}
              user={user}
              onUpdate={updateComplaintInList}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-40 bg-white/50 rounded-3xl border-2 border-dashed border-slate-100">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                <Search className="text-slate-300" size={32} />
              </div>
              <h3 className="text-[#001D4C] font-bold uppercase tracking-tight text-sm">
                No matching complaints
              </h3>
              <p className="text-slate-400 text-[11px] font-medium mt-1 uppercase tracking-widest">
                Try adjusting your search or filters
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 text-[10px] font-black text-[#001D4C] underline uppercase tracking-tighter"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        <NewComplaintModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          refreshData={fetchComplaints}
        />

        <ComplaintDetailModal
          complaint={selectedComplaint}
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={updateComplaintInList}
        />
      </div>
    </DashboardLayout>
  );
}