import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Plus, BookOpen } from "lucide-react";
import JournalPromptCard from "../components/journal/JournalPromptCard";
import JournalEntryForm from "../components/journal/JournalEntryForm";
import JournalEntryCard from "../components/journal/JournalEntryCard";

export default function Journal() {
  const [showForm, setShowForm] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: habits = [] } = useQuery({
    queryKey: ["habits-journal"],
    queryFn: () => base44.entities.Habit.filter({ is_active: true }, "sort_order"),
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ["habit-logs-journal"],
    queryFn: () => base44.entities.HabitLog.list("-date", 100),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JournalEntry.create({
      ...data,
      date: today,
      entry_type: "daily",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      setShowForm(false);
      setCurrentPrompt("");
    },
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold">
              Journal
            </h1>
            <p className="text-xs text-[#52525B] mt-1">Reflect on your journey</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-2 rounded-lg hover:bg-[#18181B] transition-colors text-[#71717A] hover:text-[#F5F2EB]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt card */}
        {!showForm && (
          <div className="mb-6">
            <JournalPromptCard
              habits={habits}
              recentLogs={recentLogs}
              onUsePrompt={(prompt) => {
                setCurrentPrompt(prompt);
                setShowForm(true);
              }}
            />
          </div>
        )}

        {/* Entry form */}
        <AnimatePresence>
          {showForm && (
            <div className="mb-6">
              <JournalEntryForm
                habits={habits}
                initialPrompt={currentPrompt}
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => {
                  setShowForm(false);
                  setCurrentPrompt("");
                }}
                isSubmitting={createMutation.isPending}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Entries list */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold mb-4">
            Recent entries
          </h2>
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#18181B] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-[#52525B]" />
              </div>
              <p className="text-sm text-[#71717A]">No entries yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-sm text-[#5EEAD4] hover:text-[#5EEAD4]/80 transition-colors"
              >
                Write your first entry
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} habits={habits} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}