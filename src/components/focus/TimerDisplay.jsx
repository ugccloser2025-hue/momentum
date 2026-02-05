import React from "react";
import { motion } from "framer-motion";

export default function TimerDisplay({ minutes, seconds, progress, label, accentColor = "#5EEAD4" }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="#27272A"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${accentColor}40)` }}
          />
        </svg>
        
        {/* Timer text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light text-[#F5F2EB] tabular-nums tracking-tight">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#71717A] mt-2 font-medium">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}