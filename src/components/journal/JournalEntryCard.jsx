import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Smile, Meh, Frown, BookOpen } from "lucide-react";

const moodIcons = {
  great: { icon: Smile, color: "#34D399" },
  good: { icon: Smile, color: "#5EEAD4" },
  okay: { icon: Meh, color: "#FCD34D" },
  struggling: { icon: Meh, color: "#FB7185" },
  rough: { icon: Frown, color: "#71717A" },
};

export default function JournalEntryCard({ entry, habits }) {
  const moodConfig = moodIcons[entry.mood] || moodIcons.okay;
  const MoodIcon = moodConfig.icon;
  const relatedHabits = habits.filter(h => entry.related_habits?.includes(h.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-[#27272A]">
          <BookOpen className="w-4 h-4 text-[#A1A1AA]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-[#71717A]">
              {format(new Date(entry.date), "EEEE, MMM d")}
            </p>
            <MoodIcon className="w-4 h-4" style={{ color: moodConfig.color }} />
          </div>
          {entry.prompt && (
            <p className="text-xs text-[#71717A] italic mb-2">"{entry.prompt}"</p>
          )}
          <p className="text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </p>
          {relatedHabits.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {relatedHabits.map(h => (
                <span
                  key={h.id}
                  className="px-2 py-0.5 rounded-full bg-[#27272A] text-[10px] text-[#71717A]"
                >
                  {h.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}