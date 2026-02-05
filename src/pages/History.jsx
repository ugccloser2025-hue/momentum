import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { CheckCircle2, BookOpen } from "lucide-react";
import JournalEntryCard from "../components/journal/JournalEntryCard";

export default function History() {
  const { data: habits = [] } = useQuery({
    queryKey: ["habits-history"],
    queryFn: () => base44.entities.Habit.list("sort_order"),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["habit-logs-history"],
    queryFn: () => base44.entities.HabitLog.list("-date", 200),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["journal-entries-history"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 100),
  });

  // Combine and sort by date
  const timeline = useMemo(() => {
    const items = [];
    
    // Add habit logs grouped by date
    const logsByDate = {};
    logs.forEach(log => {
      if (!logsByDate[log.date]) logsByDate[log.date] = [];
      logsByDate[log.date].push(log);
    });
    
    Object.entries(logsByDate).forEach(([date, dateLogs]) => {
      items.push({
        type: "habits",
        date,
        logs: dateLogs,
      });
    });

    // Add journal entries
    entries.forEach(entry => {
      items.push({
        type: "journal",
        date: entry.date,
        entry,
      });
    });

    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs, entries]);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold mb-8">
          History
        </h1>

        {timeline.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#71717A]">No activity yet</p>
            <p className="text-xs text-[#52525B] mt-1">
              Start tracking habits and journaling to see your timeline
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <motion.div
                key={`${item.type}-${item.date}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-[#27272A]" />
                  <span className="text-xs text-[#71717A]">
                    {format(new Date(item.date), "EEEE, MMM d")}
                  </span>
                  <div className="h-px flex-1 bg-[#27272A]" />
                </div>

                {item.type === "habits" && (
                  <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A]">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-[#5EEAD4]" />
                      <p className="text-sm font-medium text-[#F5F2EB]">
                        {item.logs.length} habit check-in{item.logs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {item.logs.map(log => {
                        const habit = habits.find(h => h.id === log.habit_id);
                        return habit ? (
                          <div key={log.id} className="flex items-center justify-between">
                            <span className="text-sm text-[#A1A1AA]">{habit.name}</span>
                            <span className="text-xs text-[#71717A]">
                              {log.count || 1}x
                              {log.time_of_day && ` • ${log.time_of_day}`}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {item.type === "journal" && (
                  <JournalEntryCard entry={item.entry} habits={habits} />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}