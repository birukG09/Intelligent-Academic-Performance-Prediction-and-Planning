import { Link, useLocation } from "wouter";
import { LayoutDashboard, GraduationCap, BookOpen, Library, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: GraduationCap, label: "GPA Tracker", href: "/tracker" },
  { icon: BookOpen, label: "Assignments", href: "/assignments" },
  { icon: Library, label: "Library", href: "/library" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col h-full",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight">GPA Tracker</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                    isActive 
                      ? "bg-black text-white shadow-lg shadow-black/10" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-gray-400 group-hover:text-black")} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border/50">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <h4 className="font-bold text-sm text-green-900 mb-1">Pro Tip</h4>
            <p className="text-xs text-green-700">Maintain a GPA above 3.5 for Dean's List eligibility.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
