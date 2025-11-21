"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { getOperateurs } from "@/data/billeterie";
import { RoleBilleterie } from "@/data/types";
import { useEffect } from "react";

export default function LoginSimulePage() {
  const router = useRouter();
  const { loginBilleterie, userBilleterie } = useAuth();
  const operateurs = getOperateurs();

  const handleSelectRole = (role: RoleBilleterie, operateurId?: string) => {
    loginBilleterie(role, operateurId);

    // Rediriger vers la page correspondante
    switch (role) {
      case "CLIENT":
        router.push("/client");
        break;
      case "AGENT":
        router.push("/agent");
        break;
      case "ADMIN_OPERATEUR":
        router.push("/admin");
        break;
      case "MINISTERE":
        router.push("/ministere");
        break;
    }
  };

  // Si déjà connecté, rediriger vers la page correspondante selon le rôle
  useEffect(() => {
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
    return null;
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
          <p className="text-white/80">Sélectionnez un rôle pour continuer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CLIENT */}
          <button
            onClick={() => handleSelectRole("CLIENT")}
            className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white hover:shadow-modern-xl hover:scale-105 transition-all text-left group"
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
            <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase">Agents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {operateurs.slice(0, 3).map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleSelectRole("AGENT", op.id)}
                  className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white hover:shadow-modern-xl hover:scale-105 transition-all text-left group"
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
            <h4 className="text-sm font-semibold text-white/80 mb-3 mt-4 uppercase">Administrateurs Opérateurs</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {operateurs.slice(0, 3).map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleSelectRole("ADMIN_OPERATEUR", op.id)}
                  className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white hover:shadow-modern-xl hover:scale-105 transition-all text-left group"
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
            className="bg-gradient-to-br from-[#FFD200] to-[#FFE066] border border-[#FFD200]/30 rounded-xl p-6 hover:shadow-modern-xl hover:scale-105 transition-all text-left group md:col-span-2"
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


