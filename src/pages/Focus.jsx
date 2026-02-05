import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Zap, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import TimerDisplay from "../components/focus/TimerDisplay";
import SessionTypeCard from "../components/focus/SessionTypeCard";

const SESSION_TYPES = [
  {
    id: "focus_sprint",
    title: "Focus Sprint",
    subtitle: "25 min work + 5 min break",
    icon: Zap,
    color: "#A78BFA",
    work: 25,
    break: 5,
  },
  {
    id: "body_doubling",
    title: "Body Doubling",
    subtitle: "50 min ambient co-working",
    icon: Users,
    color: "#5EEAD4",
    work: 50,
    break: 10,
  },
  {
    id: "quick_win",
    title: "Quick Win",
    subtitle: "10 min micro-sprint",
    icon: Target,
    color: "#FCD34D",
    work: 10,
    break: 3,
  },
];

export default function Focus() {
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [phase, setPhase] = useState("idle"); // idle, work, break, done
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.FocusSession.create(data),
  });

  const startSession = useCallback(() => {
    const secs = sessionType.work * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setPhase("work");
    setIsPaused(false);
  }, [sessionType]);

  const startBreak = useCallback(() => {
    const secs = sessionType.break * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setPhase("break");
    setIsPaused(false);
  }, [sessionType]);

  const reset = useCallback(() => {
    setPhase("idle");
    setSecondsLeft(0);
    setTotalSeconds(0);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (phase === "idle" || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (phase === "work") {
            // Save focus session
            saveMutation.mutate({
              duration_minutes: sessionType.work,
              break_minutes: sessionType.break,
              completed: true,
              date: format(new Date(), "yyyy-MM-dd"),
              session_type: sessionType.id,
            });
            setPhase("done");
          } else if (phase === "break") {
            setPhase("idle");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, isPaused, sessionType]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  const phaseLabel = phase === "work" ? "Focus" : phase === "break" ? "Break" : phase === "done" ? "Complete" : "Ready";
  const accentColor = phase === "break" ? "#FCD34D" : sessionType.color;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold mb-8">
          Focus Sessions
        </h1>

        {/* Session type selector */}
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-3 mb-10"
            >
              {SESSION_TYPES.map((st) => (
                <SessionTypeCard
                  key={st.id}
                  icon={st.icon}
                  title={st.title}
                  subtitle={st.subtitle}
                  color={st.color}
                  isActive={sessionType.id === st.id}
                  onClick={() => setSessionType(st)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer */}
        <div className="flex flex-col items-center">
          {phase !== "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <TimerDisplay
                minutes={minutes}
                seconds={seconds}
                progress={progress}
                label={phaseLabel}
                accentColor={accentColor}
              />
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            {phase === "idle" && (
              <Button
                onClick={startSession}
                className="h-14 px-10 rounded-2xl text-sm font-semibold transition-all"
                style={{ backgroundColor: sessionType.color, color: "#0D0D0F" }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start {sessionType.title}
              </Button>
            )}

            {(phase === "work" || phase === "break") && (
              <>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-14 h-14 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#F5F2EB] hover:bg-[#1F1F23] transition-colors"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button
                  onClick={reset}
                  className="w-14 h-14 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A] hover:text-[#F5F2EB] hover:bg-[#1F1F23] transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}

            {phase === "done" && (
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-center mb-2"
                >
                  <p className="text-lg font-semibold text-[#F5F2EB]">Session complete</p>
                  <p className="text-sm text-[#71717A] mt-1">
                    {sessionType.work} minutes of focus — well done
                  </p>
                </motion.div>
                <div className="flex gap-3">
                  <Button
                    onClick={startBreak}
                    className="rounded-2xl bg-[#FCD34D] text-[#0D0D0F] hover:bg-[#FCD34D]/90 font-semibold"
                  >
                    Take a {sessionType.break} min break
                  </Button>
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="rounded-2xl border-[#27272A] text-[#A1A1AA] hover:text-[#F5F2EB] hover:bg-[#18181B]"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Ambient note for body doubling */}
          {phase === "work" && sessionType.id === "body_doubling" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[#52525B] mt-6 text-center"
            >
              Imagine someone working quietly beside you. You're not alone.
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}