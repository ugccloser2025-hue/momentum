import React from "react";
import { motion } from "framer-motion";
import { Check, Droplets, Pill, Coffee, Zap, Target } from "lucide-react";

const categoryIcons = {
  focus: Zap,
  hydration: Droplets,
  meds: Pill,
  breaks: Coffee,
  quick_wins: Target,
};

const categoryColors = {
  focus: { bg: "bg-[#A78BFA]/10", border: "border-[#A78BFA]/20", text: "text-[#A78BFA]", ring: "ring-[#A78BFA]" },
  hydration: { bg: "bg-[#5EEAD4]/10", border: "border-[#5EEAD4]/20", text: "text-[#5EEAD4]", ring: "ring-[#5EEAD4]" },
  meds: { bg: "bg-[#FB7185]/10", border: "border-[#FB7185]/20", text: "text-[#FB7185]", ring: "ring-[#FB7185]" },
  breaks: { bg: "bg-[#FCD34D]/10", border: "border-[#FCD34D]/20", text: "text-[#FCD34D]", ring: "ring-[#FCD34D]" },
  quick_wins: { bg: "bg-[#34D399]/10", border: "border-[#34D399]/20", text: "text-[#34D399]", ring: "ring-[#34D399]" },
};

export default function HabitCard({ habit, todayCount, onCheckIn }) {
  const Icon = categoryIcons[habit.category] || Zap;
  const colors = categoryColors[habit.category] || categoryColors.focus;
  const isComplete = todayCount >= (habit.target_count || 1);
  const progress = Math.min(todayCount / (habit.target_count || 1), 1);

  return (
    <motion.button
      onClick={() => !isComplete && onCheckIn(habit)}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
        isComplete
          ? `${colors.bg} ${colors.border} opacity-60`
          : `bg-[#18181B] border-[#27272A] hover:border-[#3F3F46] hover:bg-[#1F1F23]`
      }`}
    >
      {/* Progress ring background */}
      {!isComplete && progress > 0 && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-5"
          style={{
            background: `linear-gradient(135deg, transparent ${(1 - progress) * 100}%, currentColor)`,
          }}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${colors.bg}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isComplete ? colors.text : "text-[#F5F2EB]"}`}>
              {habit.name}
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              {todayCount}/{habit.target_count || 1} today
            </p>
          </div>
        </div>

        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isComplete 
            ? `${colors.bg} ${colors.text}` 
            : "border border-[#3F3F46]"
        }`}>
          {isComplete && <Check className="w-4 h-4" />}
        </div>
      </div>

      {/* Progress bar */}
      {!isComplete && (
        <div className="mt-3 h-1 rounded-full bg-[#27272A] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${colors.text.replace("text-", "bg-")}`}
          />
        </div>
      )}
    </motion.button>
  );
}