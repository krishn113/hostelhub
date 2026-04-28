"use client";

export default function CaretakerTabSwitcher({ activeTab, setActiveTab }) {
  const tabs = ["Complaints", "Schedule"];

  return (
    <div className="flex mb-4">
      <div className="flex bg-slate-100/60 p-1 rounded-2xl border border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab 
              ? "bg-[#001D4C] text-white shadow-md" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}