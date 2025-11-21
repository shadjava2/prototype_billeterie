"use client";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  trendColor?: "positive" | "negative" | "neutral";
  delay?: number;
}

export default function KPICard({
  label,
  value,
  icon,
  color,
  trend,
  trendColor = "neutral",
  delay = 0,
}: KPICardProps) {
  const trendColors = {
    positive: "text-emerald-600",
    negative: "text-red-600",
    neutral: "text-slate-600",
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 border border-slate-200/60 hover:shadow-lg hover:border-[#0033A0]/30 transition-all duration-300 group"
      style={{
        borderLeft: `4px solid ${color}`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
          style={{
            backgroundColor: `${color}15`,
          }}
        >
          {icon}
        </div>
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
      <div className="space-y-1">
        <div className="text-sm font-medium text-slate-600">{label}</div>
        <div
          className="text-3xl font-bold"
          style={{ color: color }}
        >
          {value}
        </div>
        {trend && (
          <div className={`text-xs font-medium ${trendColors[trendColor]} flex items-center gap-1 mt-2`}>
            {trendColor === "positive" && "↗"}
            {trendColor === "negative" && "↘"}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}




