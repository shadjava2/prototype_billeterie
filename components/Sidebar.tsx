"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context";
import { Role } from "@/lib/types";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: "📊",
    roles: ["RECEPTIONNISTE", "AGENT", "DIRECTEUR", "VISITEUR", "ADMIN"],
  },
  {
    label: "Réception courrier",
    href: "/reception",
    icon: "📥",
    roles: ["RECEPTIONNISTE", "ADMIN"],
  },
  {
    label: "Numérisation",
    href: "/numerisation",
    icon: "📄",
    roles: ["RECEPTIONNISTE", "ADMIN"],
  },
  {
    label: "Encodage & indexation",
    href: "/encodage",
    icon: "⌨️",
    roles: ["RECEPTIONNISTE", "AGENT", "ADMIN"],
  },
  {
    label: "Courriers entrants",
    href: "/courriers-entrants",
    icon: "📨",
    roles: ["RECEPTIONNISTE", "AGENT", "DIRECTEUR", "VISITEUR", "ADMIN"],
  },
  {
    label: "Courriers sortants",
    href: "/sortants",
    icon: "📤",
    roles: ["AGENT", "DIRECTEUR", "ADMIN"],
  },
  {
    label: "Workflow & tâches",
    href: "/workflow",
    icon: "⚙️",
    roles: ["RECEPTIONNISTE", "AGENT", "DIRECTEUR", "ADMIN"],
  },
  {
    label: "Recherche & archives",
    href: "/recherche",
    icon: "🔍",
    roles: ["RECEPTIONNISTE", "AGENT", "DIRECTEUR", "VISITEUR", "ADMIN"],
  },
  {
    label: "Traçabilité & sécurité",
    href: "/tracabilite",
    icon: "🔐",
    roles: ["AGENT", "DIRECTEUR", "ADMIN"],
  },
  {
    label: "Rapports & analytics",
    href: "/rapports",
    icon: "📈",
    roles: ["DIRECTEUR", "ADMIN"],
  },
  {
    label: "Administration",
    href: "/administration",
    icon: "⚙️",
    roles: ["ADMIN"],
  },
  {
    label: "Assistant numérique (IA)",
    href: "/assistant-ia",
    icon: "🤖",
    roles: ["RECEPTIONNISTE", "AGENT", "DIRECTEUR", "ADMIN"],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!user) return null;

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user.role));

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          w-64 bg-gradient-to-b from-white via-slate-50/50 to-white border-r border-slate-200/60
          min-h-screen fixed left-0 top-0 z-50 shadow-modern-xl backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Titre en haut */}
        <div className="h-16 border-b border-slate-200/80 flex items-center justify-between px-4 bg-gradient-to-r from-[#0033A0]/5 via-[#FFD200]/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center shadow-lg shadow-[#0033A0]/30 animate-pulse-glow">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0033A0] leading-tight">Ministère</div>
              <div className="text-xs text-slate-600 leading-tight">Transport</div>
            </div>
          </div>
          {/* Bouton fermer mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-all text-slate-600"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {filteredMenu.map((item) => {
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault();
                    toggleExpanded(item.href);
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                  active
                    ? "bg-gradient-to-r from-[#0033A0] to-[#002280] text-white font-medium shadow-lg shadow-[#0033A0]/30 transform scale-[1.02]"
                    : "text-slate-700 hover:bg-gradient-to-r hover:from-[#0033A0]/10 hover:to-[#FFD200]/10 hover:text-[#0033A0] hover:shadow-sm hover:border border-[#0033A0]/20"
                }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {hasChildren && (
                  <span className={`text-xs transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                    ▶
                  </span>
                )}
              </Link>
              {hasChildren && isExpanded && (
                <div className="ml-8 mt-0.5 space-y-0.5">
                  {item.children
                    ?.filter((child) => child.roles.includes(user.role))
                    .map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                            childActive
                              ? "bg-[#0033A0]/15 text-[#0033A0] font-medium border border-[#0033A0]/30"
                              : "text-slate-600 hover:bg-slate-100 hover:text-[#0033A0]"
                          }`}
                        >
                          <span className="text-sm">{child.icon}</span>
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
    </>
  );
}

