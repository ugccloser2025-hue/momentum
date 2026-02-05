import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  LayoutDashboard, 
  Timer, 
  BarChart3, 
  FileDown,
  Menu,
  X,
  Zap
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Focus", icon: Timer, page: "Focus" },
  { name: "Insights", icon: BarChart3, page: "Insights" },
  { name: "Export", icon: FileDown, page: "Export" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F2EB] font-sans">
      <style>{`
        :root {
          --bg-primary: #0D0D0F;
          --bg-card: #18181B;
          --bg-card-hover: #1F1F23;
          --bg-elevated: #27272A;
          --text-primary: #F5F2EB;
          --text-secondary: #A1A1AA;
          --text-muted: #71717A;
          --accent-teal: #5EEAD4;
          --accent-amber: #FCD34D;
          --accent-violet: #A78BFA;
          --accent-rose: #FB7185;
          --border: #27272A;
        }
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        body { background: #0D0D0F; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272A; border-radius: 4px; }
      `}</style>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D0D0F]/90 backdrop-blur-xl border-b border-[#27272A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#5EEAD4]" />
          <span className="text-sm font-semibold tracking-wide">DRIFT</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-[#18181B] transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0D0D0F]/95 backdrop-blur-xl pt-16">
          <nav className="flex flex-col items-center gap-2 p-6">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    isActive 
                      ? "bg-[#5EEAD4]/10 text-[#5EEAD4]" 
                      : "text-[#A1A1AA] hover:text-[#F5F2EB] hover:bg-[#18181B]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center py-6 border-r border-[#27272A] bg-[#0D0D0F]/80 backdrop-blur-xl z-50">
        <div className="mb-8">
          <Zap className="w-5 h-5 text-[#5EEAD4]" />
        </div>
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                title={item.name}
                className={`p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-[#5EEAD4]/10 text-[#5EEAD4]" 
                    : "text-[#71717A] hover:text-[#F5F2EB] hover:bg-[#18181B]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#27272A] text-[#F5F2EB] text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="md:ml-16 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}