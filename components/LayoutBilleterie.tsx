"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context";
import { useRouter, usePathname } from "next/navigation";
import { RoleBilleterie } from "@/data/types";
import { MOCK_USERS_BILLETERIE, getDefaultUserForRole } from "@/lib/auth-billeterie";
import { getOperateurs } from "@/data/billeterie";
import SidebarBilleterie from "./SidebarBilleterie";

export default function LayoutBilleterie({ children }: { children: React.ReactNode }) {
  const { userBilleterie, loginBilleterie, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selecteurOpen, setSelecteurOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si pas de user billeterie, rediriger vers la page de sélection
  useEffect(() => {
    if (!userBilleterie && !pathname?.startsWith("/login-simule")) {
      router.push("/login-simule");
      return;
    }

    // Protection : rediriger vers la bonne page selon le rôle si l'utilisateur est sur une mauvaise page
    if (userBilleterie && pathname) {
      const roleRoutes: Record<RoleBilleterie, string[]> = {
        CLIENT: ["/client"],
        AGENT: ["/agent"],
        ADMIN_OPERATEUR: ["/admin"],
        MINISTERE: ["/ministere"],
      };

      const allowedRoutes = roleRoutes[userBilleterie.role] || [];
      const isOnAllowedRoute = allowedRoutes.some((route) => pathname.startsWith(route));

      // Si l'utilisateur n'est pas sur une route autorisée et n'est pas sur login-simule, rediriger
      if (!isOnAllowedRoute && !pathname.startsWith("/login-simule")) {
        const defaultRoutes: Record<RoleBilleterie, string> = {
          CLIENT: "/client?view=search",
          AGENT: "/agent?view=dashboard",
          ADMIN_OPERATEUR: "/admin?view=dashboard",
          MINISTERE: "/ministere?view=dashboard",
        };
        // Utiliser window.location pour forcer un rechargement complet et éviter les problèmes de cache
        window.location.href = defaultRoutes[userBilleterie.role];
      }
    }
  }, [userBilleterie, pathname, router]);

  const handleSelectRole = (role: RoleBilleterie, operateurId?: string) => {
    // Si c'est le même rôle et opérateur, ne rien faire
    if (userBilleterie.role === role && userBilleterie.operateurId === operateurId) {
      setSelecteurOpen(false);
      return;
    }

    // Déconnexion propre avant changement
    logout();
    setSelecteurOpen(false);

    // Petit délai pour s'assurer que la déconnexion est bien effectuée
    setTimeout(() => {
      // Nouveau login avec le nouveau rôle
      loginBilleterie(role, operateurId);

      // Rediriger vers la page correspondante avec rechargement complet
      const routes = {
        CLIENT: "/client?view=search",
        AGENT: "/agent?view=dashboard",
        ADMIN_OPERATEUR: "/admin?view=dashboard",
        MINISTERE: "/ministere?view=dashboard",
      };

      const targetRoute = routes[role] || "/login";

      // Utiliser window.location pour un rechargement complet et propre
      // Cela permet de réinitialiser complètement l'état de la page
      window.location.href = targetRoute;
    }, 150);
  };

  if (!userBilleterie) {
    return null;
  }

  const operateurs = getOperateurs();

  return (
    <div className="flex min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      {/* Sidebar */}
      <SidebarBilleterie isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 shadow-sm w-full">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            {/* Logo & Menu Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center shadow-md shadow-[#0033A0]/25">
                  <span className="text-white text-xs font-bold">BT</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0033A0] leading-tight">Billeterie Nationale</div>
                  <div className="text-xs text-slate-500 leading-tight">Ministère des Transports</div>
                </div>
              </div>
            </div>

          {/* Sélecteur de rôle et déconnexion */}
          <div className="flex items-center gap-3">
            {/* Sélecteur de rôle */}
            <div className="relative">
              <button
                onClick={() => setSelecteurOpen(!selecteurOpen)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-[#0033A0]/40 hover:shadow-md transition-all flex items-center justify-between gap-2 min-w-[200px] active:scale-95 hover:scale-105"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-lg">
                    {userBilleterie.role === "CLIENT" ? "👤" :
                     userBilleterie.role === "AGENT" ? "🎫" :
                     userBilleterie.role === "ADMIN_OPERATEUR" ? "⚙️" : "🏛️"}
                  </span>
                  <span className="font-semibold">{userBilleterie.nom}</span>
                  {userBilleterie.operateurId && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {userBilleterie.operateurId}
                    </span>
                  )}
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${selecteurOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

            {selecteurOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSelecteurOpen(false)}
                />
                <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-in">
                  <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto">
                    {/* CLIENT */}
                    <button
                      onClick={() => handleSelectRole("CLIENT")}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm ${
                        userBilleterie.role === "CLIENT"
                          ? "bg-gradient-to-r from-[#0033A0]/10 to-[#002280]/10 text-[#0033A0] font-semibold border border-[#0033A0]/20"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">👤</span>
                        <span>Client</span>
                      </div>
                    </button>

                    {/* AGENTS */}
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Agents</div>
                    {operateurs.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => handleSelectRole("AGENT", op.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm ${
                          userBilleterie.role === "AGENT" && userBilleterie.operateurId === op.id
                            ? "bg-gradient-to-r from-[#0033A0]/10 to-[#002280]/10 text-[#0033A0] font-semibold border border-[#0033A0]/20"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🎫</span>
                          <div className="flex-1">
                            <div className="font-medium">Agent {op.nom}</div>
                            <div className="text-xs text-slate-500">{op.type}</div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* ADMINS */}
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Administrateurs</div>
                    {operateurs.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => handleSelectRole("ADMIN_OPERATEUR", op.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm ${
                          userBilleterie.role === "ADMIN_OPERATEUR" && userBilleterie.operateurId === op.id
                            ? "bg-gradient-to-r from-[#0033A0]/10 to-[#002280]/10 text-[#0033A0] font-semibold border border-[#0033A0]/20"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">⚙️</span>
                          <div className="flex-1">
                            <div className="font-medium">Admin {op.nom}</div>
                            <div className="text-xs text-slate-500">{op.type}</div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* MINISTERE */}
                    <div className="border-t border-slate-200 mt-2 pt-2">
                      <button
                        onClick={() => handleSelectRole("MINISTERE")}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm ${
                          userBilleterie.role === "MINISTERE"
                            ? "bg-gradient-to-r from-[#FFD200]/20 to-[#FFE066]/20 text-[#0033A0] font-semibold border border-[#FFD200]/40"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🏛️</span>
                          <span className="font-medium">Ministère des Transports</span>
                        </div>
                      </button>
                    </div>

                    {/* Déconnexion */}
                    <div className="border-t border-slate-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          router.push("/login");
                        }}
                        className="w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm hover:bg-red-50 text-red-600 hover:text-red-700 font-medium active:scale-95"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🚪</span>
                          <span>Se déconnecter</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>

            {/* Bouton Déconnexion */}
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all active:scale-95 hover:scale-105 flex items-center gap-2"
              title="Se déconnecter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

        {/* Contenu principal */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

