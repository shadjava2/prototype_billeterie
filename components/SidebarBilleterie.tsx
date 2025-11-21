"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { RoleBilleterie } from "@/data/types";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: RoleBilleterie[];
  badge?: number;
  viewParam?: string; // Paramètre pour changer la vue interne
}

const menuItems: MenuItem[] = [
  // CLIENT
  {
    label: "Recherche & Achat",
    href: "/client",
    icon: "🔍",
    roles: ["CLIENT"],
    viewParam: "search",
  },
  {
    label: "Réservation",
    href: "/client",
    icon: "📅",
    roles: ["CLIENT"],
    viewParam: "reservation",
  },
  {
    label: "Mes Tickets",
    href: "/client",
    icon: "🎫",
    roles: ["CLIENT"],
    viewParam: "myTickets",
  },
  // AGENT
  {
    label: "Dashboard",
    href: "/agent",
    icon: "📊",
    roles: ["AGENT"],
    viewParam: "dashboard",
  },
  {
    label: "Vente Rapide",
    href: "/agent",
    icon: "💰",
    roles: ["AGENT"],
    viewParam: "vente",
  },
  {
    label: "Contrôle Tickets",
    href: "/agent",
    icon: "✓",
    roles: ["AGENT"],
    viewParam: "controle",
  },
  {
    label: "Historique",
    href: "/agent",
    icon: "📋",
    roles: ["AGENT"],
    viewParam: "historique",
  },
  // ADMIN_OPERATEUR
  {
    label: "Dashboard",
    href: "/admin",
    icon: "📊",
    roles: ["ADMIN_OPERATEUR"],
    viewParam: "dashboard",
  },
  {
    label: "Gestion Lignes",
    href: "/admin",
    icon: "🛤️",
    roles: ["ADMIN_OPERATEUR"],
    viewParam: "lignes",
  },
  {
    label: "Gestion Départs",
    href: "/admin",
    icon: "📅",
    roles: ["ADMIN_OPERATEUR"],
    viewParam: "departs",
  },
  {
    label: "Statistiques",
    href: "/admin",
    icon: "📈",
    roles: ["ADMIN_OPERATEUR"],
    viewParam: "dashboard",
  },
  // MINISTERE
  {
    label: "Dashboard National",
    href: "/ministere",
    icon: "📊",
    roles: ["MINISTERE"],
    viewParam: "dashboard",
  },
  {
    label: "Opérateurs",
    href: "/ministere",
    icon: "🚌",
    roles: ["MINISTERE"],
    viewParam: "operateurs",
  },
  {
    label: "Anomalies",
    href: "/ministere",
    icon: "⚠️",
    roles: ["MINISTERE"],
    viewParam: "anomalies",
  },
];

interface SidebarBilleterieProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarBilleterie({ isOpen = false, onClose }: SidebarBilleterieProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userBilleterie } = useAuth();

  if (!userBilleterie) return null;

  // Filtrer les items selon le rôle
  const filteredMenu = menuItems.filter((item) => item.roles.includes(userBilleterie.role));

  const isActive = (item: MenuItem) => {
    const isOnSamePage = pathname === item.href;
    const currentView = searchParams.get("view");

    // Si on est sur la bonne page et que le paramètre view correspond
    if (isOnSamePage && item.viewParam) {
      // Si pas de paramètre view dans l'URL, le premier item (par défaut) est actif
      if (!currentView && item.viewParam === getDefaultViewForPath(pathname)) {
        return true;
      }
      return currentView === item.viewParam;
    }

    // Sinon, juste vérifier si on est sur la bonne page
    return isOnSamePage;
  };

  const getDefaultViewForPath = (path: string): string => {
    if (path === "/client") return "search";
    if (path === "/agent") return "dashboard";
    if (path === "/admin") return "dashboard";
    if (path === "/ministere") return "dashboard";
    return "";
  };

  const handleMenuItemClick = (item: MenuItem, e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) onClose();

    const url = item.viewParam
      ? `${item.href}?view=${item.viewParam}`
      : item.href;

    // Utiliser le router Next.js pour une navigation fluide
    router.push(url);
  };

  const getRoleLabel = () => {
    switch (userBilleterie.role) {
      case "CLIENT":
        return "Espace Client";
      case "AGENT":
        return `Agent ${userBilleterie.operateurId || ""}`;
      case "ADMIN_OPERATEUR":
        return `Admin ${userBilleterie.operateurId || ""}`;
      case "MINISTERE":
        return "Ministère";
      default:
        return "Utilisateur";
    }
  };

  const getRoleColor = () => {
    switch (userBilleterie.role) {
      case "CLIENT":
        return "from-blue-500 to-blue-600";
      case "AGENT":
        return "from-green-500 to-green-600";
      case "ADMIN_OPERATEUR":
        return "from-purple-500 to-purple-600";
      case "MINISTERE":
        return "from-[#FFD200] to-[#FFE066]";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72 bg-white border-r border-slate-200/60
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 shadow-xl
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo & Header */}
        <div className="h-20 border-b border-slate-200/60 flex items-center justify-between px-6 bg-gradient-to-r from-white via-slate-50/50 to-white">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center shadow-lg shadow-[#0033A0]/25 group-hover:scale-105 transition-transform">
              <span className="text-white text-sm font-bold">BT</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#0033A0] leading-tight">Billeterie</div>
              <div className="text-xs text-slate-500 leading-tight">Nationale</div>
            </div>
          </Link>
          {/* Bouton fermer mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Role Badge */}
        <div className={`px-6 py-5 bg-gradient-to-r ${getRoleColor()} text-white shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-md ring-2 ring-white/20">
              <span className="text-xl">
                {userBilleterie.role === "CLIENT" ? "👤" :
                 userBilleterie.role === "AGENT" ? "🎫" :
                 userBilleterie.role === "ADMIN_OPERATEUR" ? "⚙️" : "🏛️"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate mb-0.5">{userBilleterie.nom}</div>
              <div className="text-xs opacity-95 truncate font-medium">{getRoleLabel()}</div>
              {userBilleterie.operateurId && (
                <div className="text-xs opacity-80 truncate mt-1 bg-white/20 px-2 py-0.5 rounded-md inline-block">
                  {userBilleterie.operateurId}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {filteredMenu.map((item, index) => {
            const active = isActive(item);
            const href = item.viewParam
              ? `${item.href}?view=${item.viewParam}`
              : item.href;

            return (
              <a
                key={`${item.href}-${index}`}
                href={href}
                onClick={(e) => handleMenuItemClick(item, e)}
                className={`
                  group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 cursor-pointer
                  ${
                    active
                      ? "bg-gradient-to-r from-[#0033A0] to-[#002280] text-white shadow-lg shadow-[#0033A0]/30 scale-[1.02] border-l-4 border-white/50"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[#0033A0] border-l-4 border-transparent hover:border-[#0033A0]/30 hover:scale-[1.01]"
                  }
                `}
              >
                <span
                  className={`text-xl flex-shrink-0 transition-all duration-300 ${
                    active ? "drop-shadow-md" : "group-hover:scale-125"
                  }`}
                >
                  {item.icon}
                </span>
                <span className={`flex-1 font-semibold text-sm transition-colors ${active ? "text-white" : "text-slate-700 group-hover:text-[#0033A0]"}`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
                      active
                        ? "bg-white/25 text-white shadow-sm"
                        : "bg-slate-200 text-slate-700 group-hover:bg-[#0033A0]/10 group-hover:text-[#0033A0]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {active && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-white animate-pulse shadow-sm" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200/60 p-5 bg-gradient-to-b from-white to-slate-50/50">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">Ministère</div>
                <div className="text-xs text-slate-600 truncate font-medium">des Transports</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              Plateforme nationale de gestion de billeterie pour les entreprises publiques de transport
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <div className="text-xs text-slate-500 font-medium">
                © 2025 Billeterie Nationale
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

