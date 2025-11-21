"use client";

interface SearchCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function SearchCard({ children, title, className = "" }: SearchCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-[#0033A0] mb-6">{title}</h2>
      )}
      {children}
    </div>
  );
}




