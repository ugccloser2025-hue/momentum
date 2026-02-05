import React, { useState } from "react";
import { motion } from "framer-motion";
import { Smile, Meh, Frown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const moods = [
  { value: "great", label: "Great", icon: Smile, color: "#34D399" },
  { value: "good", label: "Good", icon: Smile, color: "#5EEAD4" },
  { value: "okay", label: "Okay", icon: Meh, color: "#FCD34D" },
  { value: "struggling", label: "Struggling", icon: Meh, color: "#FB7185" },
  { value: "rough", label: "Rough", icon: Frown, color: "#71717A" },
];

export default function JournalEntryForm({ habits, initialPrompt, onSubmit, onCancel }) {
  const [content, setContent] = useState(initialPrompt ? `${initialPrompt}\n\n` : "");
  const [mood, setMood] = useState("okay");
  const [selectedHabits, setSelectedHabits] = useState([]);

  const handleToggleHabit = (habitId) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({
      content: content.trim(),
      mood,
      related_habits: selectedHabits,
      prompt: initialPrompt,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4"
    >
      {/* Mood selector */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-2.5">
          How are you feeling?
        </p>
        <div className="flex gap-2">
          {moods.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex-1 p-2.5 rounded-xl border transition-all ${
                  mood === m.value
                    ? "border-[#5EEAD4]/30 bg-[#5EEAD4]/5"
                    : "border-[#27272A] hover:border-[#3F3F46]"
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: m.color }} />
                <span className="text-[10px] text-[#A1A1AA]">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Journal text */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-2">
          Your reflection
        </p>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write whatever comes to mind..."
          className="bg-[#0D0D0F] border-[#27272A] text-[#F5F2EB] placeholder:text-[#52525B] focus:border-[#5EEAD4] focus:ring-0 min-h-[120px] resize-none"
        />
      </div>

      {/* Related habits */}
      {habits.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-2.5">
            Related to
          </p>
          <div className="flex flex-wrap gap-2">
            {habits.map((h) => (
              <button
                key={h.id}
                onClick={() => handleToggleHabit(h.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedHabits.includes(h.id)
                    ? "bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/30"
                    : "bg-[#27272A] text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="flex-1 bg-[#5EEAD4] hover:bg-[#5EEAD4]/90 text-[#0D0D0F] font-semibold rounded-xl"
        >
          Save entry
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            className="rounded-xl border-[#27272A] text-[#A1A1AA] hover:text-[#F5F2EB] hover:bg-[#18181B]"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}