"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LayoutBilleterie from "@/components/LayoutBilleterie";
import KPICard from "@/components/KPICard";
import { useAuth } from "@/lib/context";
import {
  getOperateurs,
  getLignes,
  getDeparts,
  getTickets,
  getLigneById,
  getOperateurById,
} from "@/data/billeterie";
import { Operateur } from "@/data/types";

export default function MinisterePage() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") as "dashboard" | "operateurs" | "anomalies" | null;
  const [selectedOperateur, setSelectedOperateur] = useState<Operateur | null>(null);
  const [view, setView] = useState<"dashboard" | "operateurs" | "anomalies">(viewParam || "dashboard");
  
  // Synchroniser avec l'URL
  useEffect(() => {
    if (viewParam && ["dashboard", "operateurs", "anomalies"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "dashboard" | "operateurs" | "anomalies") => {
    setView(newView);
    router.push(`/ministere?view=${newView}`, { scroll: false });
  };

  const operateurs = getOperateurs();
  const lignes = getLignes();
  const departs = getDeparts();
  const tickets = getTickets();

  // Statistiques nationales
  const statsNationales = useMemo(() => {
    const recettesTotal = tickets.reduce((sum, t) => sum + t.prixPaye, 0);
    const ticketsVendus = tickets.length;

    // Recettes par opérateur
    const recettesParOperateur = operateurs.map((op) => {
      const ticketsOp = tickets.filter((t) => t.operateurId === op.id);
      const recettes = ticketsOp.reduce((sum, t) => sum + t.prixPaye, 0);
      return { operateur: op, recettes, tickets: ticketsOp.length };
    }).sort((a, b) => b.recettes - a.recettes);

    // Taux de remplissage par opérateur
    const tauxRemplissageParOperateur = operateurs.map((op) => {
      const lignesOp = lignes.filter((l) => l.operateurId === op.id);
      const lignesIds = lignesOp.map((l) => l.id);
      const departsOp = departs.filter((d) => lignesIds.includes(d.ligneId));

      if (departsOp.length === 0) return { operateur: op, taux: 0 };

      const tauxMoyen = departsOp.reduce((sum, d) => {
        return sum + (d.nombrePlacesVendues / d.nombrePlacesTotal) * 100;
      }, 0) / departsOp.length;

      return { operateur: op, taux: Math.round(tauxMoyen) };
    }).sort((a, b) => b.taux - a.taux);

    // Top lignes
    const topLignes = lignes.map((ligne) => {
      const ticketsLigne = tickets.filter((t) => t.ligneId === ligne.id);
      return {
        ligne,
        tickets: ticketsLigne.length,
        recettes: ticketsLigne.reduce((sum, t) => sum + t.prixPaye, 0),
      };
    }).sort((a, b) => b.recettes - a.recettes).slice(0, 10);

    // Recettes par jour (7 derniers jours)
    const recettesParJour = Array(7).fill(0);
    const aujourdhui = new Date();
    tickets.forEach((t) => {
      const dateAchat = new Date(t.dateAchat);
      const diffDays = Math.floor((aujourdhui.getTime() - dateAchat.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        recettesParJour[6 - diffDays] += t.prixPaye;
      }
    });

    // Anomalies simulées
    const anomalies = [
      {
        id: "ANOM-001",
        operateur: "TRANSCO",
        type: "Taux d'annulation inhabituel",
        message: "Ligne TSC-01 : taux d'annulation inhabituel (15% vs moyenne 5%)",
        niveau: "ALERTE" as const,
      },
      {
        id: "ANOM-002",
        operateur: "SNCC",
        type: "Sous-remplissage",
        message: "Train Intercités : plusieurs départs sous-remplis (<30%)",
        niveau: "INFO" as const,
      },
      {
        id: "ANOM-003",
        operateur: "RVA",
        type: "Performance",
        message: "Excellente performance : taux de remplissage moyen >90%",
        niveau: "INFO" as const,
      },
    ];

    return {
      recettesTotal,
      ticketsVendus,
      recettesParOperateur,
      tauxRemplissageParOperateur,
      topLignes,
      recettesParJour,
      anomalies,
    };
  }, [operateurs, lignes, departs, tickets]);

  if (!userBilleterie || userBilleterie.role !== "MINISTERE") {
    return (
      <LayoutBilleterie>
        <div className="text-center py-12">
          <p className="text-slate-600">Veuillez vous connecter en tant que Ministère</p>
        </div>
      </LayoutBilleterie>
    );
  }

  return (
    <LayoutBilleterie>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0033A0] mb-2 flex items-center gap-3">
            <span className="text-4xl">🏛️</span>
            Ministère des Transports
          </h1>
          <p className="text-slate-600 text-base">Vue nationale consolidée - Supervision de tous les opérateurs</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {[
            { id: "dashboard", label: "Dashboard National", icon: "📊" },
            { id: "operateurs", label: "Opérateurs", icon: "🚌" },
            { id: "anomalies", label: "Anomalies", icon: "⚠️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updateView(item.id as any)}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap font-medium text-sm active:scale-95 ${
                view === item.id
                  ? "bg-gradient-to-r from-[#0033A0] to-[#002280] text-white shadow-lg shadow-[#0033A0]/30 scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-[#0033A0]/30 hover:scale-105"
              }`}
            >
              <span className="mr-2 text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Dashboard National */}
        {view === "dashboard" && (
          <div className="space-y-6 animate-slide-in">
            {/* KPIs Nationaux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                label="Recettes totales nationales"
                value={`${(statsNationales.recettesTotal / 1000000).toFixed(2)} M FC`}
                icon="💰"
                color="#10b981"
                trend="+15.2% vs mois précédent"
                trendColor="positive"
                delay={0}
              />
              <KPICard
                label="Tickets vendus (total)"
                value={statsNationales.ticketsVendus}
                icon="🎫"
                color="#0033A0"
                trend="+8.5% vs mois précédent"
                trendColor="positive"
                delay={100}
              />
              <KPICard
                label="Opérateurs actifs"
                value={operateurs.length}
                icon="🚌"
                color="#8b5cf6"
                delay={200}
              />
              <KPICard
                label="Lignes actives"
                value={lignes.length}
                icon="🛤️"
                color="#FFD200"
                delay={300}
              />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recettes sur 7 jours */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#0033A0]">Recettes nationales sur 7 jours</h2>
                  <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">7 derniers jours</div>
                </div>
                <div className="flex items-end justify-between gap-2 h-56">
                  {statsNationales.recettesParJour.map((recette, idx) => {
                    const max = Math.max(...statsNationales.recettesParJour, 1);
                    const height = (recette / max) * 100;
                    const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                        <div className="relative w-full flex items-end justify-center h-full mb-2">
                          <div
                            className="w-full bg-gradient-to-t from-[#0033A0] via-[#0033A0] to-[#002280] rounded-t-lg hover:from-[#0040CC] hover:via-[#0033A0] hover:to-[#002280] transition-all duration-300 shadow-sm hover:shadow-md"
                            style={{ height: `${Math.max(height, 8)}%` }}
                            title={`${recette.toLocaleString("fr-FR")} FC`}
                          />
                          {recette > 0 && (
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                              {recette.toLocaleString("fr-FR")} FC
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-600">{jours[idx]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top opérateurs par recettes */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#0033A0]">Top opérateurs par recettes</h2>
                  <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">Top 5</div>
                </div>
                <div className="space-y-4">
                  {statsNationales.recettesParOperateur.slice(0, 5).map(({ operateur, recettes, tickets }, idx) => {
                    const max = Math.max(...statsNationales.recettesParOperateur.map((r) => r.recettes), 1);
                    const pourcentage = (recettes / max) * 100;
                    const colors = [
                      "from-[#FFD200] to-[#FFE066]",
                      "from-blue-400 to-blue-500",
                      "from-green-400 to-green-500",
                      "from-purple-400 to-purple-500",
                      "from-orange-400 to-orange-500",
                    ];
                    return (
                      <div key={operateur.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-slate-800">{operateur.nom}</span>
                              <p className="text-xs text-slate-500">{operateur.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#0033A0] block">
                              {(recettes / 1000000).toFixed(2)} M FC
                            </span>
                            <span className="text-xs text-slate-500">{tickets} tickets</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${colors[idx]} h-2.5 rounded-full transition-all duration-500`}
                            style={{ width: `${pourcentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Taux de remplissage par opérateur */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm lg:col-span-2">
                <h2 className="text-lg font-bold text-[#0033A0] mb-6">Taux de remplissage par opérateur</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statsNationales.tauxRemplissageParOperateur.map(({ operateur, taux }) => {
                    const colorClass = taux >= 70
                      ? "from-emerald-500 to-emerald-600"
                      : taux >= 50
                      ? "from-[#FFD200] to-[#FFE066]"
                      : "from-red-500 to-red-600";
                    return (
                      <div
                        key={operateur.id}
                        className="bg-slate-50 rounded-xl p-5 hover:bg-white hover:shadow-md border border-slate-200/60 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-slate-800">{operateur.nom}</h3>
                          <span className={`text-sm font-bold ${
                            taux >= 70 ? "text-emerald-600" :
                            taux >= 50 ? "text-[#FFD200]" :
                            "text-red-600"
                          }`}>
                            {taux}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500 group-hover:shadow-sm`}
                              style={{ width: `${taux}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{operateur.type}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top lignes */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#0033A0]">Top 10 lignes par recettes</h2>
                  <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">Top 10</div>
                </div>
                <div className="space-y-2">
                  {statsNationales.topLignes.map(({ ligne, recettes, tickets }, idx) => {
                    const operateur = getOperateurById(ligne.operateurId);
                    return (
                      <div
                        key={ligne.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md border border-slate-200/60 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-[#0033A0]">{ligne.nom}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{operateur?.nom} • {ligne.mode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0033A0] text-lg">{(recettes / 1000).toFixed(1)} K FC</p>
                          <p className="text-xs text-slate-500">{tickets} tickets</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue Opérateurs */}
        {view === "operateurs" && (
          <div className="space-y-4 animate-slide-in">
            <h2 className="text-lg font-semibold text-[#0033A0]">Tableau de bord des opérateurs</h2>
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl shadow-modern-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0033A0] to-[#002280] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Opérateur</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Mode</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Tickets vendus</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Recettes</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Taux remplissage</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operateurs.map((op, idx) => {
                    const { recettes, tickets: ticketsCount } = statsNationales.recettesParOperateur.find(
                      (r) => r.operateur.id === op.id
                    ) || { recettes: 0, tickets: 0 };
                    const { taux } = statsNationales.tauxRemplissageParOperateur.find(
                      (t) => t.operateur.id === op.id
                    ) || { taux: 0 };

                    return (
                      <tr
                        key={op.id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition-all ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#0033A0]">{op.nom}</div>
                          <div className="text-xs text-slate-500">{op.description}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {op.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{ticketsCount}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#0033A0]">
                          {(recettes / 1000).toFixed(1)} K FC
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  taux >= 70 ? "bg-green-500" :
                                  taux >= 50 ? "bg-[#FFD200]" :
                                  "bg-red-500"
                                }`}
                                style={{ width: `${taux}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{taux}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedOperateur(op)}
                            className="px-3 py-1 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-all text-sm font-medium"
                          >
                            Détail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal détail opérateur */}
            {selectedOperateur && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-modern-xl animate-slide-in max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-[#0033A0]">Détail - {selectedOperateur.nom}</h3>
                    <button
                      onClick={() => setSelectedOperateur(null)}
                      className="text-slate-500 hover:text-slate-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {(() => {
                        const { recettes, tickets: ticketsCount } = statsNationales.recettesParOperateur.find(
                          (r) => r.operateur.id === selectedOperateur.id
                        ) || { recettes: 0, tickets: 0 };
                        const { taux } = statsNationales.tauxRemplissageParOperateur.find(
                          (t) => t.operateur.id === selectedOperateur.id
                        ) || { taux: 0 };
                        const lignesOp = lignes.filter((l) => l.operateurId === selectedOperateur.id);

                        return (
                          <>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <p className="text-xs text-slate-500">Recettes totales</p>
                              <p className="text-xl font-bold text-[#0033A0]">{(recettes / 1000).toFixed(1)} K FC</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <p className="text-xs text-slate-500">Tickets vendus</p>
                              <p className="text-xl font-bold text-[#0033A0]">{ticketsCount}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <p className="text-xs text-slate-500">Taux de remplissage</p>
                              <p className="text-xl font-bold text-[#0033A0]">{taux}%</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <p className="text-xs text-slate-500">Lignes actives</p>
                              <p className="text-xl font-bold text-[#0033A0]">{lignesOp.length}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0033A0] mb-2">Lignes</h4>
                      <div className="space-y-2">
                        {lignes
                          .filter((l) => l.operateurId === selectedOperateur.id)
                          .map((ligne) => (
                            <div key={ligne.id} className="bg-slate-50 rounded-lg p-3">
                              <p className="font-medium text-[#0033A0]">{ligne.nom}</p>
                              <p className="text-xs text-slate-500">{ligne.departPrincipal} → {ligne.arriveePrincipale}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Anomalies / Supervision */}
        {view === "anomalies" && (
          <div className="space-y-4 animate-slide-in">
            <h2 className="text-lg font-semibold text-[#0033A0]">Anomalies & Supervision</h2>
            <div className="space-y-3">
              {statsNationales.anomalies.map((anomalie) => (
                <div
                  key={anomalie.id}
                  className={`bg-white/90 backdrop-blur-sm border rounded-xl p-5 shadow-modern-lg ${
                    anomalie.niveau === "ALERTE"
                      ? "border-red-200 bg-red-50/50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{anomalie.niveau === "ALERTE" ? "⚠️" : "ℹ️"}</span>
                        <span className="font-semibold text-[#0033A0]">{anomalie.type}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {anomalie.operateur}
                        </span>
                      </div>
                      <p className="text-slate-700">{anomalie.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LayoutBilleterie>
  );
}

