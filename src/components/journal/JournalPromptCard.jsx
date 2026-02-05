import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function JournalPromptCard({ habits, recentLogs, onUsePrompt }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePrompt = async () => {
    setLoading(true);
    try {
      const todayLogs = recentLogs.filter(l => l.date === new Date().toISOString().split('T')[0]);
      const completedHabits = habits.filter(h => 
        todayLogs.some(l => l.habit_id === h.id)
      );

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a gentle ADHD coach. Generate ONE brief journal prompt (max 15 words) based on:
- Completed habits today: ${completedHabits.map(h => h.name).join(", ") || "none yet"}
- Total habits: ${habits.length}

Make it reflective, non-judgmental, and ADHD-friendly. Examples:
- "How did you feel after your focus session today?"
- "What made today's wins possible?"
- "Notice anything different about your energy?"

Be specific to their habits if possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            prompt: { type: "string" }
          }
        }
      });
      setPrompt(res.prompt);
    } catch (err) {
      const defaults = [
        "What's one small thing that went well today?",
        "How are you feeling right now?",
        "What did you notice about your energy today?",
        "What made today easier or harder?",
      ];
      setPrompt(defaults[Math.floor(Math.random() * defaults.length)]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (habits.length > 0) generatePrompt();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-[#A78BFA]/5 to-[#5EEAD4]/5 border border-[#27272A]"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-[#A78BFA]/10 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-1.5">
            Journal prompt
          </p>
          {loading ? (
            <div className="h-3 bg-[#27272A] rounded-full w-3/4 animate-pulse" />
          ) : (
            <p className="text-sm text-[#A1A1AA] leading-relaxed">{prompt}</p>
          )}
        </div>
        <button
          onClick={generatePrompt}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-[#27272A] transition-colors text-[#71717A] hover:text-[#F5F2EB]"
          title="New prompt"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {!loading && prompt && (
        <button
          onClick={() => onUsePrompt(prompt)}
          className="mt-2 text-xs text-[#5EEAD4] hover:text-[#5EEAD4]/80 transition-colors"
        >
          Use this prompt
        </button>
      )}
    </motion.div>
  );
}