"use client";

interface ResultCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  details: Array<{ icon: string; text: string }>;
  price: number;
  available: number;
  total: number;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function ResultCard({
  title,
  subtitle,
  badge,
  badgeColor = "blue",
  details,
  price,
  available,
  total,
  onAction,
  actionLabel = "Acheter",
  className = "",
}: ResultCardProps) {
  const badgeColors = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const pourcentageRemplissage = (total - available) / total * 100;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:border-[#0033A0]/40 transition-all duration-300 group ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-[#0033A0] mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        {badge && (
          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${badgeColors[badgeColor as keyof typeof badgeColors]}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {details.map((detail, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-base">{detail.icon}</span>
            <span>{detail.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>💺</span>
          <span>{available} place(s) disponible(s)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0033A0] to-[#002280] transition-all duration-500"
            style={{ width: `${pourcentageRemplissage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div>
          <div className="text-xs text-slate-500">Prix unitaire</div>
          <div className="text-2xl font-bold text-[#0033A0]">
            {price.toLocaleString("fr-FR")} FC
          </div>
        </div>
        {onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}




