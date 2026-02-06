import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Download, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();

    // Load saved preferences
    const savedDarkMode = localStorage.getItem("drift_theme") !== "light";
    setDarkMode(savedDarkMode);
    
    const savedNotifications = localStorage.getItem("drift_notifications") === "true";
    setNotificationsEnabled(savedNotifications);
  }, []);

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("drift_theme", newMode ? "dark" : "light");
    window.dispatchEvent(new Event("themeChange"));
    toast.success(newMode ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem("drift_notifications", newValue.toString());
    toast.success(newValue ? "Notifications enabled" : "Notifications disabled");
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const habits = await base44.entities.Habit.list();
      const logs = await base44.entities.HabitLog.list();
      const sessions = await base44.entities.FocusSession.list();
      const journal = await base44.entities.JournalEntry.list();

      const data = {
        exported_at: new Date().toISOString(),
        user: user?.email,
        habits,
        habit_logs: logs,
        focus_sessions: sessions,
        journal_entries: journal,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drift-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
    setExporting(false);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold text-[#F5F2EB]">Settings</h1>
        <p className="text-sm text-[#71717A] mt-1">Manage your preferences and account</p>
      </motion.div>

      <div className="space-y-6">
        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#18181B] rounded-2xl border border-[#27272A] p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#5EEAD4]/10">
              <User className="w-4 h-4 text-[#5EEAD4]" />
            </div>
            <h2 className="text-sm font-semibold text-[#F5F2EB]">Account</h2>
          </div>

          {user && (
            <div className="mb-4 pb-4 border-b border-[#27272A]">
              <p className="text-xs text-[#71717A] mb-1">Signed in as</p>
              <p className="text-sm text-[#F5F2EB]">{user.email}</p>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-transparent border-[#27272A] text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#F5F2EB]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#18181B] rounded-2xl border border-[#27272A] p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#A78BFA]/10">
              {darkMode ? (
                <Moon className="w-4 h-4 text-[#A78BFA]" />
              ) : (
                <Sun className="w-4 h-4 text-[#FCD34D]" />
              )}
            </div>
            <h2 className="text-sm font-semibold text-[#F5F2EB]">Appearance</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#F5F2EB]">Dark mode</p>
              <p className="text-xs text-[#71717A] mt-0.5">
                Switch between light and dark theme
              </p>
            </div>
            <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#18181B] rounded-2xl border border-[#27272A] p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#FB7185]/10">
              <Bell className="w-4 h-4 text-[#FB7185]" />
            </div>
            <h2 className="text-sm font-semibold text-[#F5F2EB]">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#F5F2EB]">Enable notifications</p>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Gentle reminders for habits (coming soon)
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>
          </div>
        </motion.div>

        {/* Data & Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#18181B] rounded-2xl border border-[#27272A] p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#34D399]/10">
              <Download className="w-4 h-4 text-[#34D399]" />
            </div>
            <h2 className="text-sm font-semibold text-[#F5F2EB]">Data & Privacy</h2>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#71717A]">
              Export all your data including habits, logs, focus sessions, and journal entries as JSON.
            </p>
            <Button
              onClick={handleExportData}
              disabled={exporting}
              className="w-full bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export all data"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}