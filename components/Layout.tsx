"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import CourrierWhatsAppBackground from "./CourrierWhatsAppBackground";
import CommentairesPanel from "./CommentairesPanel";
import PartagerPanel from "./PartagerPanel";
import ConfigPanel from "./ConfigPanel";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [commentairesOpen, setCommentairesOpen] = useState(false);
  const [partagerOpen, setPartagerOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    // Animation d'entrée lors du changement de page
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Fond style WhatsApp avec icônes courrier */}
      <CourrierWhatsAppBackground />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 transition-all min-h-screen">
        {/* Header responsive mobile */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-modern-lg">
          {/* Barre de titre et recherche */}
          <div className="px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
            {/* Bouton menu hamburger mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Recherche - responsive */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full px-3 sm:px-4 py-2 bg-slate-50/80 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50 transition-all backdrop-blur-sm hover:border-slate-300"
                />
                <span className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Alt+Q</span>
              </div>
            </div>

            {/* Actions - responsive */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCommentairesOpen(true)}
                className="hidden sm:inline-flex px-3 py-1.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-[#0033A0]/10 hover:to-[#FFD200]/10 hover:text-[#0033A0] rounded-lg transition-all font-medium hover:shadow-md hover:shadow-[#0033A0]/10 transform hover:scale-105 active:scale-95 border border-transparent hover:border-[#0033A0]/20"
              >
                Commentaires
              </button>
              <button
                onClick={() => setCommentairesOpen(true)}
                className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700"
                aria-label="Commentaires"
              >
                💬
              </button>

              <button
                onClick={() => setPartagerOpen(true)}
                className="hidden sm:inline-flex px-3 py-1.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-[#0033A0]/10 hover:to-[#FFD200]/10 hover:text-[#0033A0] rounded-lg transition-all font-medium hover:shadow-md hover:shadow-[#0033A0]/10 transform hover:scale-105 active:scale-95 border border-transparent hover:border-[#0033A0]/20"
              >
                Partager
              </button>
              <button
                onClick={() => setPartagerOpen(true)}
                className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700"
                aria-label="Partager"
              >
                📤
              </button>

              <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>

              {/* Profil utilisateur - responsive */}
              {user && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-all hover:shadow-md transform hover:scale-105 border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center text-white text-xs font-semibold shadow-md shadow-[#0033A0]/30 flex-shrink-0">
                    {user.prenom?.[0] || ""}{user.nom?.[0] || ""}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium text-slate-900 leading-tight">
                      {user.prenom || ""} {user.nom || ""}
                    </div>
                    <div className="text-xs text-slate-500 leading-tight">
                      {user.role || ""}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setConfigOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 text-sm text-slate-600 hover:bg-gradient-to-r hover:from-[#0033A0]/10 hover:to-[#FFD200]/10 hover:text-[#0033A0] rounded-lg transition-all hover:shadow-md hover:shadow-[#0033A0]/10 transform hover:scale-105 active:scale-95 border border-transparent hover:border-[#0033A0]/20"
                title="Paramètres"
              >
                <span className="text-base">⚙️</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className={`min-h-[calc(100vh-73px)] bg-transparent px-3 sm:px-4 md:px-6 py-4 sm:py-6 ${isEntering ? "dashboard-enter" : ""}`}>
          {children}
        </main>
      </div>

      {/* Panels modaux */}
      <CommentairesPanel isOpen={commentairesOpen} onClose={() => setCommentairesOpen(false)} />
      <PartagerPanel isOpen={partagerOpen} onClose={() => setPartagerOpen(false)} />
      <ConfigPanel isOpen={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
}

