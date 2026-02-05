import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Plus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NudgeCard({ message, isLoading, suggestion, onAddHabit, onModifyHabit }) {
  return (
    <div className="space-y-3">
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

      {!isLoading && suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#34D399]/5 to-[#FCD34D]/5 border border-[#27272A]"
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#34D399]/10 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#34D399]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-1.5">
                Goal suggestion
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">{suggestion.message}</p>
              
              {suggestion.action_type === "add_new" && suggestion.suggested_habit && (
                <Button
                  onClick={() => onAddHabit(suggestion.suggested_habit)}
                  className="h-8 px-3 rounded-lg bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 text-xs font-medium"
                >
                  <Plus className="w-3 h-3 mr-1.5" />
                  Add this habit
                </Button>
              )}
              
              {suggestion.action_type === "modify_existing" && suggestion.existing_habit_name && (
                <Button
                  onClick={() => onModifyHabit(suggestion.existing_habit_name)}
                  className="h-8 px-3 rounded-lg bg-[#FCD34D]/10 hover:bg-[#FCD34D]/20 text-[#FCD34D] border border-[#FCD34D]/30 text-xs font-medium"
                >
                  <Edit3 className="w-3 h-3 mr-1.5" />
                  Modify habit
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}