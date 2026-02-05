import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function NudgeCard({ message, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-[#A78BFA]/5 to-[#5EEAD4]/5 border border-[#27272A]"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-[#A78BFA]/10 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-1.5">
            Daily insight
          </p>
          {isLoading ? (
            <div className="space-y-1.5">
              <div className="h-3 bg-[#27272A] rounded-full w-full animate-pulse" />
              <div className="h-3 bg-[#27272A] rounded-full w-3/4 animate-pulse" />
            </div>
          ) : (
            <p className="text-sm text-[#A1A1AA] leading-relaxed">{message}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}