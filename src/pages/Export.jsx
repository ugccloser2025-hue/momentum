import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";
import { FileDown, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Export() {
  const [generating, setGenerating] = useState(false);
  const [pdfContent, setPdfContent] = useState(null);
  const [range, setRange] = useState(30);

  const { data: habits = [] } = useQuery({
    queryKey: ["habits-export"],
    queryFn: () => base44.entities.Habit.list("sort_order"),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["habit-logs-export"],
    queryFn: () => base44.entities.HabitLog.list("-date", 1000),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions-export"],
    queryFn: () => base44.entities.FocusSession.list("-date", 500),
  });

  const generateReport = async () => {
    setGenerating(true);
    setPdfContent(null);

    const startDate = format(subDays(new Date(), range), "yyyy-MM-dd");
    const endDate = format(new Date(), "yyyy-MM-dd");

    const filteredLogs = logs.filter((l) => l.date >= startDate && l.date <= endDate);
    const filteredSessions = sessions.filter((s) => s.date >= startDate && s.date <= endDate);

    // Build summary
    const habitSummaries = habits.map((h) => {
      const hLogs = filteredLogs.filter((l) => l.habit_id === h.id);
      const totalCheckins = hLogs.reduce((acc, l) => acc + (l.count || 1), 0);
      const uniqueDays = new Set(hLogs.map((l) => l.date)).size;
      return { name: h.name, category: h.category, totalCheckins, daysActive: uniqueDays, target: h.target_count || 1 };
    });

    const completedSessions = filteredSessions.filter((s) => s.completed);
    const totalFocusMinutes = completedSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

    // Calculate momentum days
    let momentumDays = 0;
    const logsByDate = {};
    filteredLogs.forEach((l) => {
      if (!logsByDate[l.date]) logsByDate[l.date] = 0;
      logsByDate[l.date] += l.count || 1;
    });
    const d = new Date();
    const todayStr = format(d, "yyyy-MM-dd");
    if (logsByDate[todayStr]) momentumDays++;
    for (let i = 1; i < range; i++) {
      const dateStr = format(subDays(d, i), "yyyy-MM-dd");
      if (logsByDate[dateStr]) momentumDays++;
      else break;
    }

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a clean, professional ADHD habit tracking progress report for a therapist or doctor.

Period: ${startDate} to ${endDate}

Habit Data:
${habitSummaries.map((h) => `- ${h.name} (${h.category}): ${h.totalCheckins} check-ins over ${h.daysActive} days, target ${h.target}/day`).join("\n")}

Focus Sessions: ${completedSessions.length} sessions, ${totalFocusMinutes} total focus minutes
Current Momentum: ${momentumDays} consecutive days

Format as a structured report with:
1. Summary overview
2. Habit-by-habit breakdown with observations
3. Focus session patterns
4. Momentum/consistency assessment
5. Gentle recommendations

Tone: Clinical but warm. No toxic positivity. Factual observations.
Output as clean HTML with inline styles for printing. Use a clean, minimal design. Dark text on white background.`,
      response_json_schema: {
        type: "object",
        properties: {
          html_report: { type: "string" },
          summary: { type: "string" },
        },
      },
    });

    setPdfContent(res);
    setGenerating(false);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>DRIFT Progress Report</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        ${pdfContent.html_report}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const ranges = [
    { label: "7 days", value: 7 },
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold mb-2">
          Export
        </h1>
        <p className="text-sm text-[#52525B] mb-8">
          Generate a progress report for your therapist or doctor.
        </p>

        {/* Range selector */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-3">
            Report period
          </p>
          <div className="flex gap-2">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  range === r.value
                    ? "bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/30"
                    : "bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:border-[#3F3F46]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats preview */}
        <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] mb-6">
          <h2 className="text-sm font-semibold text-[#F5F2EB] mb-3">What's included</h2>
          <div className="space-y-2">
            {[
              `${habits.length} tracked habits`,
              `${logs.length} total check-ins`,
              `${sessions.filter((s) => s.completed).length} focus sessions`,
              "Consistency analysis",
              "Personalized observations",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5EEAD4]" />
                <span className="text-sm text-[#A1A1AA]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={generateReport}
          disabled={generating}
          className="w-full h-12 rounded-2xl bg-[#5EEAD4] hover:bg-[#5EEAD4]/90 text-[#0D0D0F] font-semibold"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating report...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>

        {/* Report preview */}
        {pdfContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] mb-4">
              <p className="text-sm text-[#A1A1AA] mb-3">{pdfContent.summary}</p>
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full rounded-2xl border-[#27272A] text-[#A1A1AA] hover:text-[#F5F2EB] hover:bg-[#18181B]"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Print / Save as PDF
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}