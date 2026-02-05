import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Insights() {
  const { data: habits = [] } = useQuery({
    queryKey: ["habits-all"],
    queryFn: () => base44.entities.Habit.list("sort_order"),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["habit-logs-all"],
    queryFn: () => base44.entities.HabitLog.list("-date", 500),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["focus-sessions-all"],
    queryFn: () => base44.entities.FocusSession.list("-date", 200),
  });

  // Last 7 days data
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayLogs = logs.filter((l) => l.date === dateStr);
      const totalCheckins = dayLogs.reduce((acc, l) => acc + (l.count || 1), 0);
      days.push({
        day: format(d, "EEE"),
        date: dateStr,
        checkins: totalCheckins,
        isToday: i === 0,
      });
    }
    return days;
  }, [logs]);

  // Time of day breakdown
  const timeBreakdown = useMemo(() => {
    const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    logs.forEach((l) => {
      if (l.time_of_day && counts[l.time_of_day] !== undefined) {
        counts[l.time_of_day] += l.count || 1;
      }
    });
    return Object.entries(counts).map(([time, count]) => ({
      time: time.charAt(0).toUpperCase() + time.slice(1),
      count,
    }));
  }, [logs]);

  // Habit completion rates
  const habitStats = useMemo(() => {
    return habits.map((h) => {
      const habitLogs = logs.filter((l) => l.habit_id === h.id);
      const daysWithLogs = new Set(habitLogs.map((l) => l.date)).size;
      const totalCheckins = habitLogs.reduce((acc, l) => acc + (l.count || 1), 0);
      return {
        name: h.name,
        category: h.category,
        daysActive: daysWithLogs,
        totalCheckins,
      };
    });
  }, [habits, logs]);

  // Focus stats
  const focusStats = useMemo(() => {
    const completed = sessions.filter((s) => s.completed);
    const totalMinutes = completed.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    return {
      totalSessions: completed.length,
      totalMinutes,
      avgPerSession: completed.length > 0 ? Math.round(totalMinutes / completed.length) : 0,
    };
  }, [sessions]);

  const maxCheckins = Math.max(...weekData.map((d) => d.checkins), 1);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold mb-8">
          Insights
        </h1>

        {/* Week overview bar chart */}
        <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] mb-4">
          <h2 className="text-sm font-semibold text-[#F5F2EB] mb-4">This week</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={24}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717A", fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    background: "#27272A",
                    border: "1px solid #3F3F46",
                    borderRadius: "12px",
                    color: "#F5F2EB",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} check-ins`, ""]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="checkins" radius={[6, 6, 0, 0]}>
                  {weekData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isToday ? "#5EEAD4" : "#27272A"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Sessions", value: focusStats.totalSessions, color: "#A78BFA" },
            { label: "Focus mins", value: focusStats.totalMinutes, color: "#5EEAD4" },
            { label: "Avg/session", value: `${focusStats.avgPerSession}m`, color: "#FCD34D" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A]"
            >
              <p className="text-2xl font-bold text-[#F5F2EB] tabular-nums">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#71717A] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Time of day */}
        <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] mb-4">
          <h2 className="text-sm font-semibold text-[#F5F2EB] mb-4">When you're most active</h2>
          <div className="grid grid-cols-4 gap-3">
            {timeBreakdown.map((t) => {
              const maxTime = Math.max(...timeBreakdown.map((x) => x.count), 1);
              const intensity = t.count / maxTime;
              return (
                <div key={t.time} className="text-center">
                  <div
                    className="w-full aspect-square rounded-xl mb-2 flex items-center justify-center"
                    style={{
                      backgroundColor: `rgba(94, 234, 212, ${0.05 + intensity * 0.2})`,
                      border: `1px solid rgba(94, 234, 212, ${intensity * 0.3})`,
                    }}
                  >
                    <span className="text-lg font-bold text-[#F5F2EB] tabular-nums">{t.count}</span>
                  </div>
                  <p className="text-[10px] text-[#71717A]">{t.time}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit leaderboard */}
        <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A]">
          <h2 className="text-sm font-semibold text-[#F5F2EB] mb-4">Habit breakdown</h2>
          {habitStats.length === 0 ? (
            <p className="text-sm text-[#52525B]">No habits tracked yet</p>
          ) : (
            <div className="space-y-3">
              {habitStats
                .sort((a, b) => b.totalCheckins - a.totalCheckins)
                .map((h) => {
                  const maxH = Math.max(...habitStats.map((x) => x.totalCheckins), 1);
                  return (
                    <div key={h.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-[#A1A1AA]">{h.name}</span>
                        <span className="text-xs text-[#71717A] tabular-nums">
                          {h.totalCheckins} check-ins · {h.daysActive} days
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#27272A] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(h.totalCheckins / maxH) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full bg-[#5EEAD4]"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}