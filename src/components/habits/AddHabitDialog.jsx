import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, Pill, Coffee, Zap, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  { value: "focus", label: "Focus", icon: Zap, color: "#A78BFA" },
  { value: "hydration", label: "Hydration", icon: Droplets, color: "#5EEAD4" },
  { value: "meds", label: "Meds", icon: Pill, color: "#FB7185" },
  { value: "breaks", label: "Breaks", icon: Coffee, color: "#FCD34D" },
  { value: "quick_wins", label: "Quick Wins", icon: Target, color: "#34D399" },
];

const presets = [
  { name: "Drink water", category: "hydration", target_count: 8 },
  { name: "Take medication", category: "meds", target_count: 1 },
  { name: "Focus sprint", category: "focus", target_count: 3 },
  { name: "Stretch break", category: "breaks", target_count: 4 },
  { name: "Make bed", category: "quick_wins", target_count: 1 },
  { name: "5-min tidy", category: "quick_wins", target_count: 1 },
  { name: "Go outside", category: "breaks", target_count: 1 },
  { name: "Deep breaths", category: "breaks", target_count: 3 },
];

export default function AddHabitDialog({ open, onClose, prefilledData, editingHabit }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("focus");
  const [targetCount, setTargetCount] = useState(1);
  const queryClient = useQueryClient();

  // Pre-fill form when dialog opens with data
  React.useEffect(() => {
    if (open) {
      if (editingHabit) {
        setName(editingHabit.name);
        setCategory(editingHabit.category);
        setTargetCount(editingHabit.target_count || 1);
      } else if (prefilledData) {
        setName(prefilledData.name || "");
        setCategory(prefilledData.category || "focus");
        setTargetCount(prefilledData.target_count || 1);
      } else {
        setName("");
        setCategory("focus");
        setTargetCount(1);
      }
    }
  }, [open, prefilledData, editingHabit]);

  const createMutation = useMutation({
    mutationFn: (data) => {
      if (editingHabit) {
        return base44.entities.Habit.update(editingHabit.id, data);
      }
      return base44.entities.Habit.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setName("");
      setCategory("focus");
      setTargetCount(1);
      onClose();
    },
  });

  const handlePreset = (preset) => {
    setName(preset.name);
    setCategory(preset.category);
    setTargetCount(preset.target_count);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      category,
      target_count: targetCount,
      is_active: true,
      sort_order: 0,
    });
  };

  if (!open) return null;

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
          className="w-full max-w-md bg-[#18181B] rounded-2xl border border-[#27272A] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#27272A]">
            <h2 className="text-lg font-semibold text-[#F5F2EB]">
              {editingHabit ? "Edit habit" : "New habit"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#27272A] transition-colors text-[#71717A]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Quick presets */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-2.5">
                Quick add
              </p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handlePreset(p)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#27272A] text-[#A1A1AA] hover:text-[#F5F2EB] hover:bg-[#3F3F46] transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-2">
                Name
              </p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Drink water"
                className="bg-[#0D0D0F] border-[#27272A] text-[#F5F2EB] placeholder:text-[#52525B] focus:border-[#5EEAD4] focus:ring-0"
              />
            </div>

            {/* Category */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-2.5">
                Category
              </p>
              <div className="grid grid-cols-5 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      category === cat.value
                        ? "border-[#5EEAD4]/30 bg-[#5EEAD4]/5"
                        : "border-[#27272A] hover:border-[#3F3F46]"
                    }`}
                  >
                    <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                    <span className="text-[10px] text-[#A1A1AA]">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target count */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-2">
                Daily target
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                  className="w-10 h-10 rounded-xl bg-[#0D0D0F] border border-[#27272A] text-[#A1A1AA] hover:text-[#F5F2EB] transition-colors flex items-center justify-center text-lg"
                >
                  −
                </button>
                <span className="text-2xl font-semibold text-[#F5F2EB] w-12 text-center tabular-nums">
                  {targetCount}
                </span>
                <button
                  onClick={() => setTargetCount(targetCount + 1)}
                  className="w-10 h-10 rounded-xl bg-[#0D0D0F] border border-[#27272A] text-[#A1A1AA] hover:text-[#F5F2EB] transition-colors flex items-center justify-center text-lg"
                >
                  +
                </button>
                <span className="text-xs text-[#52525B]">times/day</span>
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={!name.trim() || createMutation.isPending}
              className="w-full bg-[#5EEAD4] hover:bg-[#5EEAD4]/90 text-[#0D0D0F] font-semibold rounded-xl h-11"
            >
              {createMutation.isPending 
                ? (editingHabit ? "Updating..." : "Creating...") 
                : (editingHabit ? "Update habit" : "Add habit")}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}