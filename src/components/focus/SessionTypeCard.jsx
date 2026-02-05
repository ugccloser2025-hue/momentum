import React from "react";
import { motion } from "framer-motion";

export default function SessionTypeCard({ icon: Icon, title, subtitle, isActive, onClick, color }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border transition-all duration-200 text-left ${
        isActive
          ? `bg-[${color}]/10 border-[${color}]/30`
          : "bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]"
      }`}
      style={isActive ? { 
        backgroundColor: `${color}10`, 
        borderColor: `${color}30` 
      } : {}}
    >
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#F5F2EB]">{title}</h3>
          <p className="text-xs text-[#71717A] mt-0.5">{subtitle}</p>
        </div>
      </div>
    </motion.button>
  );
}