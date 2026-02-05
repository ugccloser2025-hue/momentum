import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Plus, Edit3, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  active: { icon: Clock, color: "text-[#FCD34D]", bg: "bg-[#FCD34D]/10", label: "Active" },
  acted_on: { icon: CheckCircle2, color: "text-[#34D399]", bg: "bg-[#34D399]/10", label: "Acted on" },
  dismissed: { icon: XCircle, color: "text-[#71717A]", bg: "bg-[#27272A]", label: "Dismissed" },
};

export default function SuggestionHistoryModal({ open, onClose, suggestions, habits, onAddHabit, onModifyHabit }) {
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  if (!open) return null;

  const handleAction = async (suggestion) => {
    if (suggestion.action_type === "add_new" && suggestion.suggested_habit) {
      onAddHabit(suggestion.suggested_habit);
      await base44.entities.AISuggestion.update(suggestion.id, { status: "acted_on" });
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
    } else if (suggestion.action_type === "modify_existing" && suggestion.existing_habit_name) {
      onModifyHabit(suggestion.existing_habit_name);
      await base44.entities.AISuggestion.update(suggestion.id, { status: "acted_on" });
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
    }
  };

  const handleDismiss = async (id) => {
    await base44.entities.AISuggestion.update(id, { status: "dismissed" });
    queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#18181B] rounded-2xl border border-[#27272A] overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#27272A]">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F2EB]">Suggestion History</h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                {suggestions.length} {suggestions.length === 1 ? "suggestion" : "suggestions"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#27272A] transition-colors text-[#71717A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-[#27272A] flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 text-[#52525B]" />
                </div>
                <p className="text-sm text-[#71717A]">No suggestions yet</p>
                <p className="text-xs text-[#52525B] mt-1">
                  The AI will generate personalized suggestions as you build habits
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const status = statusConfig[suggestion.status] || statusConfig.active;
                  const StatusIcon = status.icon;
                  const isExpanded = expandedId === suggestion.id;

                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        suggestion.status === "dismissed"
                          ? "border-[#27272A] opacity-60"
                          : "border-[#27272A] hover:border-[#3F3F46]"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-1.5 rounded-lg ${status.bg} mt-0.5`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">
                              {format(new Date(suggestion.date), "MMM d, yyyy")}
                            </p>
                            <span className={`text-[10px] ${status.color}`}>{status.label}</span>
                          </div>
                          <p className="text-sm text-[#A1A1AA] leading-relaxed mb-2">
                            {suggestion.suggestion_text}
                          </p>

                          {/* Reasoning toggle */}
                          {suggestion.reasoning && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                              className="text-[10px] text-[#71717A] hover:text-[#A1A1AA] transition-colors mb-2"
                            >
                              {isExpanded ? "Hide reasoning" : "Show reasoning"}
                            </button>
                          )}

                          <AnimatePresence>
                            {isExpanded && suggestion.reasoning && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mb-3"
                              >
                                <p className="text-xs text-[#71717A] pl-3 border-l-2 border-[#27272A]">
                                  {suggestion.reasoning}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Actions */}
                          {suggestion.status === "active" && (
                            <div className="flex gap-2">
                              {suggestion.action_type === "add_new" && suggestion.suggested_habit && (
                                <Button
                                  onClick={() => handleAction(suggestion)}
                                  className="h-7 px-2.5 rounded-lg bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 text-xs font-medium"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add habit
                                </Button>
                              )}

                              {suggestion.action_type === "modify_existing" && suggestion.existing_habit_name && (
                                <Button
                                  onClick={() => handleAction(suggestion)}
                                  className="h-7 px-2.5 rounded-lg bg-[#FCD34D]/10 hover:bg-[#FCD34D]/20 text-[#FCD34D] border border-[#FCD34D]/30 text-xs font-medium"
                                >
                                  <Edit3 className="w-3 h-3 mr-1" />
                                  Modify
                                </Button>
                              )}

                              <Button
                                onClick={() => handleDismiss(suggestion.id)}
                                className="h-7 px-2.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#71717A] text-xs font-medium"
                              >
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}