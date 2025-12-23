import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  delay?: number;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, subtext, icon: Icon, delay = 0, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-primary/10 transition-colors duration-300">
          <Icon className="w-6 h-6 text-gray-900 group-hover:text-primary transition-colors duration-300" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'up' ? '↑' : '↓'} 2.4%
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-3xl font-bold font-display tracking-tight text-black mb-1">
          {value}
        </h3>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {subtext && (
          <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
            {subtext}
          </p>
        )}
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
