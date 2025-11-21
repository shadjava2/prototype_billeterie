"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LayoutBilleterie from "@/components/LayoutBilleterie";
import { useAuth } from "@/lib/context";
import { useBilleterie } from "@/lib/billeterie-context";
import { Ligne, Depart } from "@/data/types";

export default function AdminPage() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getOperateurById,
    getLignesByOperateur,
    getDepartsByOperateur,
    getTicketsByOperateur,
    getLigneById,
    getDepartById,
    creerLigne,
    creerDepart,
    mettreAJourStatutDepart,
    lignes,
    departs,
    tickets,
  } = useBilleterie();

  const viewParam = searchParams.get("view") as "dashboard" | "lignes" | "departs" | null;
  const [view, setView] = useState<"dashboard" | "lignes" | "departs">(viewParam || "dashboard");

  // Synchroniser avec l'URL
  useEffect(() => {
    if (viewParam && ["dashboard", "lignes", "departs"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "dashboard" | "lignes" | "departs") => {
    setView(newView);
    router.push(`/admin?view=${newView}`, { scroll: false });
  };
  const [selectedLigne, setSelectedLigne] = useState<Ligne | null>(null);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    code: "",
    nom: "",
    type: "URBAIN" as const,
    mode: "BUS" as const,
    departPrincipal: "",
    arriveePrincipale: "",
    dureeMoyenneMinutes: 60,
    prix: 0,
  });
  const [showModalLigne, setShowModalLigne] = useState(false);
  const [showModalDepart, setShowModalDepart] = useState(false);
  const [lignePourDepart, setLignePourDepart] = useState<Ligne | null>(null);
  const [nouveauDepart, setNouveauDepart] = useState({
    codeBus: "",
    dateHeureDepart: "",
    nombrePlacesTotal: 50,
    nombrePlacesReservees: 0,
    disponiblePourAchatImmediat: true,
  });

  const operateurId = userBilleterie?.operateurId;
  const operateur = operateurId ? getOperateurById(operateurId) : null;

  const lignesOperateur = useMemo(() => {
    if (!operateurId) return [];
    return getLignesByOperateur(operateurId);
  }, [operateurId, lignes]);

  const departsOperateur = useMemo(() => {
    if (!operateurId) return [];
    return getDepartsByOperateur(operateurId);
  }, [operateurId, departs]);

  const ticketsOperateur = useMemo(() => {
    if (!operateurId) return [];
    return getTicketsByOperateur(operateurId);
  }, [operateurId, tickets]);


  // Statistiques
  const stats = useMemo(() => {
    if (!operateurId) return {
      recettesTotal: 0,
      ticketsVendus: 0,
      tauxRemplissage: 0,
      recettesParJour: Array(7).fill(0),
      ticketsParLigne: [] as { ligneId: string; count: number }[],
      canalAchat: { WEB: 0, AGENT_POS: 0 },
    };

    const recettesTotal = ticketsOperateur.reduce((sum, t) => sum + t.prixPaye, 0);
    const ticketsVendus = ticketsOperateur.length;

    const tauxRemplissage = departsOperateur.length > 0
      ? departsOperateur.reduce((sum, d) => sum + (d.nombrePlacesVendues / d.nombrePlacesTotal) * 100, 0) / departsOperateur.length
      : 0;

    // Recettes par jour (7 derniers jours)
    const recettesParJour = Array(7).fill(0);
    const aujourdhui = new Date();
    ticketsOperateur.forEach((t) => {
      const dateAchat = new Date(t.dateAchat);
      const diffDays = Math.floor((aujourdhui.getTime() - dateAchat.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        recettesParJour[6 - diffDays] += t.prixPaye;
      }
    });

    // Tickets par ligne
    const ticketsParLigne: { ligneId: string; count: number }[] = [];
    lignesOperateur.forEach((l) => {
      const count = ticketsOperateur.filter((t) => t.ligneId === l.id).length;
      ticketsParLigne.push({ ligneId: l.id, count });
    });

    // Canal d'achat
    const canalAchat = {
      WEB: ticketsOperateur.filter((t) => t.canalAchat === "WEB").length,
      AGENT_POS: ticketsOperateur.filter((t) => t.canalAchat === "AGENT_POS").length,
    };

    return {
      recettesTotal,
      ticketsVendus,
      tauxRemplissage: Math.round(tauxRemplissage),
      recettesParJour,
      ticketsParLigne,
      canalAchat,
    };
  }, [operateurId, ticketsOperateur, departsOperateur, lignesOperateur]);

  const handleAjouterLigne = () => {
    if (!operateurId) {
      alert("❌ Erreur : Opérateur non défini");
      return;
    }

    if (!nouvelleLigne.code || !nouvelleLigne.nom || !nouvelleLigne.departPrincipal || !nouvelleLigne.arriveePrincipale || !nouvelleLigne.prix || nouvelleLigne.prix <= 0) {
      alert("❌ Veuillez remplir tous les champs obligatoires et définir un prix valide");
      return;
    }

    try {
      const ligneCreee = creerLigne(
        operateurId,
        nouvelleLigne.code,
        nouvelleLigne.nom,
        nouvelleLigne.type,
        nouvelleLigne.mode,
        nouvelleLigne.departPrincipal,
        nouvelleLigne.arriveePrincipale,
        nouvelleLigne.dureeMoyenneMinutes,
        nouvelleLigne.prix
      );

      alert(`✅ Ligne "${ligneCreee.nom}" créée avec succès !\nPrix: ${ligneCreee.prix.toLocaleString("fr-FR")} FC`);
      setShowModalLigne(false);
      setNouvelleLigne({
        code: "",
        nom: "",
        type: "URBAIN",
        mode: "BUS",
        departPrincipal: "",
        arriveePrincipale: "",
        dureeMoyenneMinutes: 60,
        prix: 0,
      });
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleAjouterDepart = () => {
    if (!lignePourDepart) {
      alert("❌ Veuillez sélectionner une ligne");
      return;
    }

    if (!nouveauDepart.codeBus || !nouveauDepart.dateHeureDepart) {
      alert("❌ Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const departCree = creerDepart(
        lignePourDepart.id,
        nouveauDepart.codeBus,
        nouveauDepart.dateHeureDepart,
        nouveauDepart.nombrePlacesTotal,
        nouveauDepart.nombrePlacesReservees,
        nouveauDepart.disponiblePourAchatImmediat
      );

      alert(`✅ Départ créé avec succès !\nBus: ${departCree.codeBus}\nDate: ${new Date(departCree.dateHeureDepart).toLocaleString("fr-FR")}\nPrix: ${departCree.prix.toLocaleString("fr-FR")} FC`);
      setShowModalDepart(false);
      setLignePourDepart(null);
      setNouveauDepart({
        codeBus: "",
        dateHeureDepart: "",
        nombrePlacesTotal: 50,
        nombrePlacesReservees: 0,
        disponiblePourAchatImmediat: true,
      });
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleCloturerDepart = (departId: string) => {
    const depart = getDepartById(departId);
    if (depart && depart.statut === "PLANIFIE") {
      mettreAJourStatutDepart(departId, "TERMINE");
      alert("✅ Départ clôturé avec succès");
    }
  };

  if (!userBilleterie || !operateur) {
    return (
      <LayoutBilleterie>
        <div className="text-center py-12">
          <p className="text-slate-600">Veuillez vous connecter en tant qu'administrateur</p>
        </div>
      </LayoutBilleterie>
    );
  }

  return (
    <LayoutBilleterie>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#0033A0]">Espace Admin - {operateur.nom}</h1>
          <p className="text-slate-500 text-sm mt-1">Gestion des lignes, tarifs et statistiques</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "lignes", label: "Lignes", icon: "🛤️" },
            { id: "departs", label: "Départs", icon: "📅" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updateView(item.id as any)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap active:scale-95 ${
                view === item.id
                  ? "bg-gradient-to-r from-[#0033A0] to-[#002280] text-white shadow-lg scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-[#0033A0]/30 hover:scale-105"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {view === "dashboard" && (
          <div className="space-y-6 animate-slide-in">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Recettes totales", value: `${stats.recettesTotal.toLocaleString("fr-FR")} FC`, icon: "💰", color: "#10b981" },
                { label: "Tickets vendus", value: stats.ticketsVendus, icon: "🎫", color: "#0033A0" },
                { label: "Taux de remplissage", value: `${stats.tauxRemplissage}%`, icon: "📊", color: "#8b5cf6" },
                { label: "Lignes actives", value: lignesOperateur.length, icon: "🛤️", color: "#FFD200" },
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 hover:shadow-modern-lg hover:scale-[1.02] transition-all"
                  style={{ borderLeft: `4px solid ${kpi.color}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{kpi.icon}</span>
                  </div>
                  <div className="text-sm text-slate-600 mb-1">{kpi.label}</div>
                  <div className="text-2xl font-bold text-[#0033A0]">{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recettes sur 7 jours */}
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Recettes sur 7 jours</h2>
                <div className="flex items-end justify-between gap-2 h-48">
                  {stats.recettesParJour.map((recette, idx) => {
                    const max = Math.max(...stats.recettesParJour, 1);
                    const height = (recette / max) * 100;
                    const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-gradient-to-t from-[#0033A0] to-[#002280] rounded-t hover:from-[#0033A0] hover:to-[#0040CC] transition-all shadow-sm"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${recette.toLocaleString("fr-FR")} FC`}
                        />
                        <span className="text-xs text-slate-600 mt-2">{jours[idx]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Canal d'achat */}
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Canal d'achat</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">WEB</span>
                      <span className="text-sm font-bold text-[#0033A0]">{stats.canalAchat.WEB}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#0033A0] to-[#002280] h-3 rounded-full transition-all"
                        style={{
                          width: `${stats.ticketsVendus > 0 ? (stats.canalAchat.WEB / stats.ticketsVendus) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">AGENT_POS</span>
                      <span className="text-sm font-bold text-[#0033A0]">{stats.canalAchat.AGENT_POS}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#10b981] to-[#059669] h-3 rounded-full transition-all"
                        style={{
                          width: `${stats.ticketsVendus > 0 ? (stats.canalAchat.AGENT_POS / stats.ticketsVendus) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets par ligne */}
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg lg:col-span-2">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Tickets vendus par ligne</h2>
                <div className="space-y-3">
                  {stats.ticketsParLigne.map(({ ligneId, count }) => {
                    const ligne = getLigneById(ligneId);
                    const max = Math.max(...stats.ticketsParLigne.map((t) => t.count), 1);
                    const pourcentage = (count / max) * 100;
                    return (
                      <div key={ligneId}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700">{ligne?.nom || "Ligne inconnue"}</span>
                          <span className="text-sm font-bold text-[#0033A0]">{count}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#FFD200] to-[#FFE066] h-2 rounded-full transition-all"
                            style={{ width: `${pourcentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gestion des lignes */}
        {view === "lignes" && (
          <div className="space-y-4 animate-slide-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#0033A0]">Gestion des lignes</h2>
              <button
                onClick={() => setShowModalLigne(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-medium active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
              >
                + Ajouter une ligne
              </button>
            </div>

            {lignesOperateur.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                <p className="text-slate-500">Aucune ligne configurée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lignesOperateur.map((ligne) => (
                  <div
                    key={ligne.id}
                    className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 hover:shadow-modern-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-[#0033A0]">{ligne.nom}</h3>
                        <p className="text-sm text-slate-600">{ligne.code}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {ligne.mode}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{ligne.departPrincipal} → {ligne.arriveePrincipale}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{ligne.dureeMoyenneMinutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏷️</span>
                        <span>{ligne.type}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-xs text-slate-500">Prix unitaire</span>
                        <span className="text-lg font-bold text-[#0033A0]">{ligne.prix.toLocaleString("fr-FR")} FC</span>
                      </div>
                      <button
                        onClick={() => {
                          setLignePourDepart(ligne);
                          setShowModalDepart(true);
                        }}
                        className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all text-sm font-medium active:scale-95 hover:scale-105"
                      >
                        + Ajouter un départ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal ajouter ligne */}
            {showModalLigne && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-modern-xl animate-slide-in">
                  <h3 className="text-xl font-semibold text-[#0033A0] mb-4">Ajouter une ligne</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                      <input
                        type="text"
                        value={nouvelleLigne.code}
                        onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, code: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={nouvelleLigne.nom}
                        onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, nom: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                          value={nouvelleLigne.type}
                          onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, type: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                        >
                          <option value="URBAIN">Urbain</option>
                          <option value="INTERURBAIN">Interurbain</option>
                          <option value="INTERNATIONAL">International</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
                        <select
                          value={nouvelleLigne.mode}
                          onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, mode: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                        >
                          <option value="BUS">Bus</option>
                          <option value="TRAIN">Train</option>
                          <option value="BATEAU">Bateau</option>
                          <option value="AVION">Avion</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Départ principal</label>
                      <input
                        type="text"
                        value={nouvelleLigne.departPrincipal}
                        onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, departPrincipal: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Arrivée principale</label>
                      <input
                        type="text"
                        value={nouvelleLigne.arriveePrincipale}
                        onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, arriveePrincipale: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Durée (minutes)</label>
                        <input
                          type="number"
                          value={nouvelleLigne.dureeMoyenneMinutes}
                          onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, dureeMoyenneMinutes: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prix (FC) *</label>
                        <input
                          type="number"
                          value={nouvelleLigne.prix}
                          onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, prix: Number(e.target.value) })}
                          placeholder="Ex: 5000"
                          min="0"
                          step="100"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowModalLigne(false)}
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all active:scale-95 hover:scale-105"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleAjouterLigne}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-medium active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

            {/* Modal ajouter départ */}
            {showModalDepart && lignePourDepart && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-modern-xl animate-slide-in">
                  <h3 className="text-xl font-semibold text-[#0033A0] mb-2">Ajouter un départ</h3>
                  <p className="text-sm text-slate-600 mb-4">Ligne: {lignePourDepart.nom}</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Code Bus/Véhicule *</label>
                      <input
                        type="text"
                        value={nouveauDepart.codeBus}
                        onChange={(e) => setNouveauDepart({ ...nouveauDepart, codeBus: e.target.value.toUpperCase() })}
                        placeholder="Ex: BUS-TSC-100"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date et heure de départ *</label>
                      <input
                        type="datetime-local"
                        value={nouveauDepart.dateHeureDepart}
                        onChange={(e) => setNouveauDepart({ ...nouveauDepart, dateHeureDepart: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de places *</label>
                      <input
                        type="number"
                        value={nouveauDepart.nombrePlacesTotal}
                        onChange={(e) => setNouveauDepart({ ...nouveauDepart, nombrePlacesTotal: Number(e.target.value) })}
                        min="1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Prix par place</span>
                        <span className="text-lg font-bold text-[#0033A0]">{lignePourDepart.prix.toLocaleString("fr-FR")} FC</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Prix défini pour cette ligne</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="achatImmediat"
                        checked={nouveauDepart.disponiblePourAchatImmediat}
                        onChange={(e) => setNouveauDepart({ ...nouveauDepart, disponiblePourAchatImmediat: e.target.checked })}
                        className="w-4 h-4 text-[#0033A0] border-slate-300 rounded focus:ring-[#0033A0]"
                      />
                      <label htmlFor="achatImmediat" className="text-sm text-slate-700">
                        Disponible pour achat immédiat
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowModalDepart(false);
                          setLignePourDepart(null);
                        }}
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all active:scale-95 hover:scale-105"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleAjouterDepart}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-medium active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        Créer le départ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vue par départ */}
        {view === "departs" && (
          <div className="space-y-4 animate-slide-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#0033A0]">Gestion des départs</h2>
              <button
                onClick={() => {
                  if (lignesOperateur.length === 0) {
                    alert("❌ Veuillez d'abord créer une ligne");
                    updateView("lignes");
                    return;
                  }
                  setLignePourDepart(lignesOperateur[0]);
                  setShowModalDepart(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-medium active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
              >
                + Ajouter un départ
              </button>
            </div>
            {departsOperateur.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                <p className="text-slate-500">Aucun départ prévu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departsOperateur
                  .sort((a, b) => new Date(a.dateHeureDepart).getTime() - new Date(b.dateHeureDepart).getTime())
                  .map((dep) => {
                    const ligne = getLigneById(dep.ligneId);
                    const pourcentageRemplissage = (dep.nombrePlacesVendues / dep.nombrePlacesTotal) * 100;
                    return (
                      <div
                        key={dep.id}
                        className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 hover:shadow-modern-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-[#0033A0]">{ligne?.nom || "Ligne inconnue"}</h3>
                            <p className="text-sm text-slate-600">
                              {new Date(dep.dateHeureDepart).toLocaleString("fr-FR")}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            dep.statut === "PLANIFIE" ? "bg-blue-100 text-blue-700" :
                            dep.statut === "EN_COURS" ? "bg-green-100 text-green-700" :
                            dep.statut === "TERMINE" ? "bg-slate-100 text-slate-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {dep.statut}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Places totales</p>
                            <p className="font-bold text-[#0033A0]">{dep.nombrePlacesTotal}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Places vendues</p>
                            <p className="font-bold text-[#0033A0]">{dep.nombrePlacesVendues}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Remplissage</p>
                            <p className="font-bold text-[#0033A0]">{Math.round(pourcentageRemplissage)}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-gradient-to-r from-[#0033A0] to-[#002280] h-2 rounded-full transition-all"
                            style={{ width: `${pourcentageRemplissage}%` }}
                          />
                        </div>
                        {dep.statut === "PLANIFIE" && (
                          <button
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir clôturer ce départ ?")) {
                                handleCloturerDepart(dep.id);
                              }
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium text-sm active:scale-95 hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            Clôturer le départ
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutBilleterie>
  );
}

