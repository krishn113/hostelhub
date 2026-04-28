"use client";
import api from "@/lib/api"; // Adjust the path based on your folder structure
import { useState } from "react";
import { X, Tool, Home, Globe, AlertTriangle, Send } from "lucide-react";

export default function NewComplaintModal({ isOpen, onClose, refreshData, user }) {
  const [formData, setFormData] = useState({
    type: "Room", // Default
    category: "",
    title: "",
    description: "",
    isUrgent: false,
  });

  if (!isOpen) return null;

  const categories = ["Electrical", "Plumbing", "Furniture", "WiFi/LAN", "Other"];

const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.category || !formData.title || !formData.description) {
        alert("Please fill in all required fields (Title, Category, and Description)");
        return;
      }

      const payload = {
        ...formData,
        // 2. Now 'user' is defined as a prop, so this won't throw an error!
        hostelId: user?.hostelId || null 
      };

      const response = await api.post("/complaints", payload);

      if (response.status === 201) {
        alert("Complaint Filed Successfully!");
        refreshData(); 
        onClose();     
        setFormData({ 
          title: "", 
          description: "", 
          category: "Electrical", 
          type: "Room", 
          isUrgent: false 
        });
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert(err.response?.data?.message || "Failed to submit complaint");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#001D4C]/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#001D4C] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest">Raise Complaint</h2>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em] mt-1">Maintenance Support</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* 1. Type Selection (Room vs General) */}
          <div className="flex gap-4">
            {[
              { id: "Room", icon: <Home size={16} />, label: "My Room" },
              { id: "General", icon: <Globe size={16} />, label: "General Area" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: item.id })}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${
                  formData.type === item.id 
                  ? "border-[#001D4C] bg-blue-50/50 text-[#001D4C] font-bold shadow-inner" 
                  : "border-slate-100 text-slate-400 font-bold hover:border-slate-200"
                }`}
              >
                {item.icon}
                <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. Category Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                required
                className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-xs font-bold text-[#001D4C] focus:ring-2 focus:ring-blue-100"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* 3. Urgency Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
              <button
                type="button"
                onClick={() => setFormData({...formData, isUrgent: !formData.isUrgent})}
                className={`w-full py-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  formData.isUrgent 
                  ? "bg-rose-50 border-rose-200 text-rose-600 font-bold" 
                  : "bg-slate-50 border-transparent text-slate-400 font-bold"
                }`}
              >
                <AlertTriangle size={14} />
                <span className="text-[11px] uppercase tracking-wider">{formData.isUrgent ? "Urgent" : "Standard"}</span>
              </button>
            </div>
          </div>

          {/* 4. Subject/Heading */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">What is the issue?</label>
            <input 
              required
              type="text" 
              placeholder="E.g. Ceiling Fan not rotating..."
              className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-medium text-[#001D4C] placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* 5. Detailed Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Details </label>
            <textarea 
              rows="3"
              placeholder="Describe the problem in detail..."
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-medium text-[#001D4C] placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 resize-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-[#001D4C] text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-xl shadow-blue-900/10 mt-4"
          >
            Submit Complaint <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}