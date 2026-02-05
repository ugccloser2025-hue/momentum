import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function MomentumBadge({ days, label = "momentum days" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#18181B] border border-[#27272A]"
    >
      <div className="p-2 rounded-xl bg-[#FCD34D]/10">
        <Flame className="w-5 h-5 text-[#FCD34D]" />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-[#F5F2EB] tabular-nums">{days}</span>
          <span className="text-xs text-[#71717A] font-medium">{label}</span>
        </div>
        <p className="text-[10px] text-[#52525B] mt-0.5">
          {days === 0 ? "Start fresh — no pressure" : "Keep flowing, no guilt if you miss one"}
        </p>
      </div>
    </motion.div>
  );
}