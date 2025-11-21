"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { getOperateurs } from "@/data/billeterie";
import { RoleBilleterie } from "@/data/types";

export default function LoginPage() {
  const router = useRouter();
  const { loginBilleterie, userBilleterie } = useAuth();
  const operateurs = getOperateurs();

  const handleSelectRole = (role: RoleBilleterie, operateurId?: string) => {
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
  };

  useEffect(() => {
    // Si déjà connecté, rediriger vers le dashboard
    if (userBilleterie) {
      switch (userBilleterie.role) {
        case "CLIENT":
          router.push("/client?view=search");
          break;
        case "AGENT":
          router.push("/agent?view=dashboard");
          break;
        case "ADMIN_OPERATEUR":
          router.push("/admin?view=dashboard");
          break;
        case "MINISTERE":
          router.push("/ministere?view=dashboard");
          break;
      }
    }
  }, [userBilleterie, router]);

  if (userBilleterie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0033A0] via-[#002280] to-[#0033A0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0033A0] via-[#002280] to-[#0033A0] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-slide-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFD200] to-[#FFE066] flex items-center justify-center shadow-lg">
            <span className="text-4xl">🎫</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Plateforme Nationale de Billeterie</h1>
          <p className="text-white/80">Ministère des Transports - RDC</p>
          <p className="text-white/60 text-sm mt-2">Sélectionnez un profil pour continuer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CLIENT */}
          <button
            onClick={() => handleSelectRole("CLIENT")}
            className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white hover:shadow-xl hover:scale-105 transition-all text-left group active:scale-95"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0033A0]">Client</h3>
                <p className="text-sm text-slate-600">Acheter des tickets</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Espace citoyen pour rechercher et acheter des tickets de transport</p>
          </button>

          {/* AGENTS */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Agents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {operateurs.slice(0, 3).map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleSelectRole("AGENT", op.id)}
                  className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white hover:shadow-xl hover:scale-105 transition-all text-left group active:scale-95"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">🎫</span>
                    <span className="font-semibold text-[#0033A0]">Agent {op.nom}</span>
                  </div>
                  <p className="text-xs text-slate-500">Vendre et contrôler les tickets</p>
                </button>
              ))}
            </div>
          </div>

          {/* ADMINS */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white/80 mb-3 mt-4 uppercase tracking-wider">Administrateurs Opérateurs</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {operateurs.slice(0, 3).map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleSelectRole("ADMIN_OPERATEUR", op.id)}
                  className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white hover:shadow-xl hover:scale-105 transition-all text-left group active:scale-95"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">⚙️</span>
                    <span className="font-semibold text-[#0033A0]">Admin {op.nom}</span>
                  </div>
                  <p className="text-xs text-slate-500">Gérer lignes, tarifs et statistiques</p>
                </button>
              ))}
            </div>
          </div>

          {/* MINISTERE */}
          <button
            onClick={() => handleSelectRole("MINISTERE")}
            className="bg-gradient-to-br from-[#FFD200] to-[#FFE066] border border-[#FFD200]/30 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all text-left group md:col-span-2 active:scale-95"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0033A0]">Ministère des Transports</h3>
                <p className="text-sm text-slate-700">Vue nationale consolidée</p>
              </div>
            </div>
            <p className="text-sm text-slate-700">Supervision de tous les opérateurs, statistiques nationales et analytics</p>
          </button>
        </div>
      </div>
    </div>
  );
}
