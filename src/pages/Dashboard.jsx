import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, isToday, parseISO } from "date-fns";
import { Plus, AlertCircle, History } from "lucide-react";
import HabitCard from "../components/habits/HabitCard";
import MomentumBadge from "../components/habits/MomentumBadge";
import NudgeCard from "../components/habits/NudgeCard";
import AddHabitDialog from "../components/habits/AddHabitDialog";
import TaskParalysisButton from "../components/habits/TaskParalysisButton";
import SuggestionHistoryModal from "../components/habits/SuggestionHistoryModal";
import WelcomeMessage from "../components/onboarding/WelcomeMessage";

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Wind down time";
};

export default function Dashboard() {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [nudge, setNudge] = useState("");
  const [nudgeLoading, setNudgeLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);
  const [prefilledHabit, setPrefilledHabit] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showSuggestionHistory, setShowSuggestionHistory] = useState(false);
  const [currentSuggestionId, setCurrentSuggestionId] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: () => base44.entities.Habit.filter({ is_active: true }, "sort_order"),
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["habit-logs-today", today],
    queryFn: () => base44.entities.HabitLog.filter({ date: today }),
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ["habit-logs-recent"],
    queryFn: () => base44.entities.HabitLog.list("-date", 200),
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: () => base44.entities.AISuggestion.list("-date", 50),
  });

  // Check if first time user
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("drift_welcome_seen");
    if (!hasSeenWelcome && habits.length === 0) {
      setShowWelcome(true);
    }
  }, [habits]);

  // Calculate momentum days (consecutive days with at least 1 completion, soft reset)
  const momentumDays = useMemo(() => {
    if (!recentLogs.length) return 0;
    const logsByDate = {};
    recentLogs.forEach((log) => {
      if (!logsByDate[log.date]) logsByDate[log.date] = 0;
      logsByDate[log.date] += log.count || 1;
    });
    let count = 0;
    let d = new Date();
    // Check today first
    const todayStr = format(d, "yyyy-MM-dd");
    if (logsByDate[todayStr]) count++;
    // Check previous days
    for (let i = 1; i < 60; i++) {
      const dateStr = format(subDays(d, i), "yyyy-MM-dd");
      if (logsByDate[dateStr]) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [recentLogs]);

  // Calculate habit completion rates for analysis
  const habitAnalysis = useMemo(() => {
    return habits.map((h) => {
      const habitLogs = recentLogs.filter((l) => l.habit_id === h.id);
      const last7Days = recentLogs.filter((l) => {
        const logDate = new Date(l.date);
        const daysAgo = (new Date() - logDate) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7 && l.habit_id === h.id;
      });
      const totalCheckins = habitLogs.reduce((acc, l) => acc + (l.count || 1), 0);
      const last7Checkins = last7Days.reduce((acc, l) => acc + (l.count || 1), 0);
      const avgPerDay = last7Days.length > 0 ? last7Checkins / 7 : 0;
      const completionRate = h.target_count ? (avgPerDay / h.target_count) * 100 : 0;
      return {
        name: h.name,
        category: h.category,
        target: h.target_count || 1,
        avgPerDay: avgPerDay.toFixed(1),
        completionRate: completionRate.toFixed(0),
        totalCheckins,
      };
    });
  }, [habits, recentLogs]);

  // Generate nudge and personalized suggestions
  useEffect(() => {
    const generateNudge = async () => {
      setNudgeLoading(true);
      const completedToday = todayLogs.reduce((acc, l) => acc + (l.count || 1), 0);
      const totalTarget = habits.reduce((acc, h) => acc + (h.target_count || 1), 0);
      const timeOfDay = getTimeOfDay();
      
      const defaultNudges = [
        "Start small — even one check-in counts. You're already here.",
        "Remember: progress isn't linear. Small steps compound.",
        "Tip: pair a new habit with something you already do daily.",
        "Your brain loves novelty — try doing a familiar habit in a new spot today.",
        "2-minute rule: if it takes less than 2 minutes, do it now.",
      ];

      if (habits.length === 0 || recentLogs.length < 5) {
        setNudge(defaultNudges[Math.floor(Math.random() * defaultNudges.length)]);
        setSuggestion(null);
        setNudgeLoading(false);
        return;
      }

      try {
        const analysisText = habitAnalysis.map(
          (h) => `${h.name} (${h.category}): ${h.completionRate}% completion rate, averaging ${h.avgPerDay}/${h.target} per day`
        ).join("\n");

        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a gentle, supportive ADHD habit coach analyzing user behavior to provide personalized insights and goal suggestions.

Current data:
- Time of day: ${timeOfDay}
- Habits today: ${completedToday}/${totalTarget} completed
- Momentum streak: ${momentumDays} days
- Total habits tracked: ${habits.length}

Last 7 days habit performance:
${analysisText}

Generate:
1. A short micro-nudge (max 20 words) - warm, specific, zero-pressure. No exclamation marks. No toxic positivity.
2. A personalized goal suggestion based on their patterns with clear reasoning. Consider:
   - If they consistently hit a habit goal (>80% completion), suggest a related new habit or slight increase
   - If they struggle with a habit (<40% completion), suggest modifications or smaller targets
   - If they're doing well overall, suggest a complementary habit from a category they don't have yet
   - Keep suggestions realistic and ADHD-friendly (small, specific, achievable)

Format the suggestion as a friendly observation + specific actionable suggestion (max 30 words).
3. Provide clear reasoning (1-2 sentences) explaining the data pattern that led to this suggestion.`,
          response_json_schema: {
            type: "object",
            properties: {
              nudge: { type: "string" },
              suggestion: { type: "string" },
              reasoning: { 
                type: "string",
                description: "Why this suggestion was made based on the data"
              },
              action_type: { 
                type: "string",
                enum: ["add_new", "modify_existing"],
                description: "Whether to suggest adding a new habit or modifying an existing one"
              },
              suggested_habit: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  target_count: { type: "number" },
                },
              },
              existing_habit_name: {
                type: "string",
                description: "If action_type is modify_existing, name of the habit to modify"
              },
            },
          },
        });
        setNudge(res.nudge);
        
        // Save suggestion to database
        const savedSuggestion = await base44.entities.AISuggestion.create({
          suggestion_text: res.suggestion,
          reasoning: res.reasoning,
          action_type: res.action_type,
          suggested_habit: res.suggested_habit,
          existing_habit_name: res.existing_habit_name,
          status: "active",
          date: today,
        });
        
        setCurrentSuggestionId(savedSuggestion.id);
        setSuggestion({
          id: savedSuggestion.id,
          message: res.suggestion,
          reasoning: res.reasoning,
          action_type: res.action_type,
          suggested_habit: res.suggested_habit,
          existing_habit_name: res.existing_habit_name,
        });
        
        queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
      } catch {
        setNudge(defaultNudges[Math.floor(Math.random() * defaultNudges.length)]);
        setSuggestion(null);
      }
      setNudgeLoading(false);
    };
    if (habits.length >= 0) generateNudge();
  }, [habits.length, todayLogs.length, recentLogs.length]);

  const checkInMutation = useMutation({
    mutationFn: async (habit) => {
      const existing = todayLogs.find((l) => l.habit_id === habit.id);
      if (existing) {
        await base44.entities.HabitLog.update(existing.id, {
          count: (existing.count || 1) + 1,
        });
      } else {
        await base44.entities.HabitLog.create({
          habit_id: habit.id,
          date: today,
          count: 1,
          time_of_day: getTimeOfDay(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-logs-today"] });
      queryClient.invalidateQueries({ queryKey: ["habit-logs-recent"] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId) => base44.entities.Habit.delete(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const getCountForHabit = (habitId) => {
    const log = todayLogs.find((l) => l.habit_id === habitId);
    return log ? log.count || 1 : 0;
  };

  const completedCount = habits.filter(
    (h) => getCountForHabit(h.id) >= (h.target_count || 1)
  ).length;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
      {/* Welcome overlay */}
      {showWelcome && (
        <WelcomeMessage
          onGetStarted={() => {
            localStorage.setItem("drift_welcome_seen", "true");
            setShowWelcome(false);
            setShowAddHabit(true);
          }}
        />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#71717A] text-xs uppercase tracking-[0.2em] font-medium">
              {format(new Date(), "EEEE, MMM d")}
            </p>
            <h1 className="text-2xl font-semibold text-[#F5F2EB] mt-1">
              {getGreeting()}
            </h1>
            {habits.length > 0 && (
              <p className="text-sm text-[#52525B] mt-1">
                {completedCount}/{habits.length} habits done
              </p>
            )}
          </div>
          <button
            onClick={() => setShowSuggestionHistory(true)}
            className="p-2 rounded-lg hover:bg-[#18181B] transition-colors text-[#71717A] hover:text-[#F5F2EB]"
            title="Suggestion history"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Momentum + Task Paralysis Button */}
      {habits.length > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <MomentumBadge days={momentumDays} />
          </div>
          <TaskParalysisButton habits={habits} onCheckIn={(h) => checkInMutation.mutate(h)} />
        </div>
      )}

      {/* Nudge */}
      <div className="mb-8">
        <NudgeCard 
          message={nudge} 
          isLoading={nudgeLoading} 
          suggestion={suggestion}
          onAddHabit={async (habitData) => {
            setPrefilledHabit(habitData);
            setShowAddHabit(true);
            if (currentSuggestionId) {
              await base44.entities.AISuggestion.update(currentSuggestionId, { status: "acted_on" });
              queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
            }
          }}
          onModifyHabit={async (habitName) => {
            const habit = habits.find(h => h.name === habitName);
            if (habit) {
              setEditingHabit(habit);
              setShowAddHabit(true);
              if (currentSuggestionId) {
                await base44.entities.AISuggestion.update(currentSuggestionId, { status: "acted_on" });
                queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
              }
            }
          }}
          onDismiss={async () => {
            if (currentSuggestionId) {
              await base44.entities.AISuggestion.update(currentSuggestionId, { status: "dismissed" });
              queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
              setSuggestion(null);
              setCurrentSuggestionId(null);
            }
          }}
        />
      </div>

      {/* Habits */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold">
            Today's Habits
          </h2>
          <button
            onClick={() => setShowAddHabit(true)}
            className="p-1.5 rounded-lg hover:bg-[#18181B] transition-colors text-[#71717A] hover:text-[#F5F2EB]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#18181B] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5 text-[#52525B]" />
            </div>
            <p className="text-sm text-[#71717A]">No habits yet</p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="mt-3 text-sm text-[#5EEAD4] hover:text-[#5EEAD4]/80 transition-colors"
            >
              Add your first habit
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {habits.map((habit, i) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <HabitCard
                    habit={habit}
                    todayCount={getCountForHabit(habit.id)}
                    onCheckIn={() => checkInMutation.mutate(habit)}
                    onEdit={(h) => {
                      setEditingHabit(h);
                      setShowAddHabit(true);
                    }}
                    onDelete={(h) => {
                      if (confirm(`Delete "${h.name}"? This will remove all logs for this habit.`)) {
                        deleteHabitMutation.mutate(h.id);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AddHabitDialog 
        open={showAddHabit} 
        onClose={() => {
          setShowAddHabit(false);
          setPrefilledHabit(null);
          setEditingHabit(null);
        }}
        prefilledData={prefilledHabit}
        editingHabit={editingHabit}
      />

      <SuggestionHistoryModal
        open={showSuggestionHistory}
        onClose={() => setShowSuggestionHistory(false)}
        suggestions={suggestions}
        habits={habits}
        onAddHabit={(habitData) => {
          setPrefilledHabit(habitData);
          setShowAddHabit(true);
          setShowSuggestionHistory(false);
        }}
        onModifyHabit={(habitName) => {
          const habit = habits.find(h => h.name === habitName);
          if (habit) {
            setEditingHabit(habit);
            setShowAddHabit(true);
            setShowSuggestionHistory(false);
          }
        }}
      />
    </div>
  );
}