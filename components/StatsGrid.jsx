"use client";
import { motion } from "framer-motion";

const StatCard = ({ label, value, icon, colorClass }) => {
  // Check if it's the Hostel card to apply the smaller font
  const isHostel = label.toLowerCase() === "hostel";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 md:gap-4 hover:shadow-lg transition-all group min-w-0"
    >
      {/* ICON */}
      <div className={`shrink-0 p-2.5 md:p-3 rounded-xl ${colorClass} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>

      {/* TEXT AREA */}
      <div className="flex-1 min-w-0"> 
        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider md:tracking-widest mb-0.5 leading-tight break-words">
          {label}
        </p>
        
        {/* SCROLLABLE VALUE CONTAINER WITH INLINE SCROLLBAR HIDING */}
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h3 className={`
            font-black text-slate-800 leading-tight whitespace-nowrap
            ${isHostel 
              ? "text-sm md:text-base opacity-90" // Significantly smaller for Hostel
              : "text-lg md:text-2xl"            // Regular size for others
            }
          `}>
            {value}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default function StatsGrid({ stats }) {
  const gridCols = stats.length === 2 ? "lg:grid-cols-2" : stats.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-2 ${gridCols} gap-4 mb-8`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}