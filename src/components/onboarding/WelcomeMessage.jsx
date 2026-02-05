import React from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomeMessage({ onGetStarted }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 bg-[#0D0D0F]/95 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-[#18181B] border border-[#27272A] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5EEAD4]/20 to-[#A78BFA]/20 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-[#5EEAD4]" />
        </div>
        
        <h1 className="text-2xl font-bold text-[#F5F2EB] mb-3">Welcome to DRIFT</h1>
        
        <p className="text-sm text-[#A1A1AA] leading-relaxed mb-2">
          A minimalist habit tracker designed for ADHD brains.
        </p>
        
        <div className="text-left bg-[#0D0D0F] rounded-xl p-4 mb-6 space-y-2">
          <p className="text-xs text-[#71717A]">
            ✓ Track 3-5 core habits, not dozens
          </p>
          <p className="text-xs text-[#71717A]">
            ✓ Zero pressure, no guilt trips
          </p>
          <p className="text-xs text-[#71717A]">
            ✓ AI-powered insights & prompts
          </p>
          <p className="text-xs text-[#71717A]">
            ✓ Focus timer & quick wins
          </p>
        </div>

        <Button
          onClick={onGetStarted}
          className="w-full bg-[#5EEAD4] hover:bg-[#5EEAD4]/90 text-[#0D0D0F] font-semibold rounded-xl h-11"
        >
          Get started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}