import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle } from "lucide-react";

const microTasks = [
  "Drink a glass of water right now",
  "Stand up and stretch for 30 seconds",
  "Take 3 deep breaths",
  "Put one thing away",
  "Send that one message you've been avoiding",
  "Set a 2-minute timer and tidy your desk",
  "Step outside for 60 seconds",
  "Write down one thing on your mind",
  "Unclench your jaw and drop your shoulders",
  "Open a window or change the air",
];

export default function TaskParalysisButton({ habits, onCheckIn }) {
  const [suggestion, setSuggestion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const getSuggestion = () => {
    // Mix micro tasks with actual habits
    const options = [...microTasks];
    habits.forEach((h) => {
      options.push(`Check in: ${h.name}`);
    });
    const random = options[Math.floor(Math.random() * options.length)];
    setSuggestion(random);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 5000);
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={getSuggestion}
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#FB7185]/10 to-[#FCD34D]/10 border border-[#27272A] hover:border-[#3F3F46] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FB7185]/10">
            <Shuffle className="w-4 h-4 text-[#FB7185] group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[#F5F2EB]">Feeling stuck?</h3>
            <p className="text-xs text-[#71717A]">Tap for a random micro-task</p>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isVisible && suggestion && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            className="absolute left-0 right-0 -bottom-14 z-10"
          >
            <div className="mx-2 px-4 py-2.5 rounded-xl bg-[#27272A] border border-[#3F3F46] text-sm text-[#F5F2EB] text-center shadow-xl">
              {suggestion}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}