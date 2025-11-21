"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LayoutBilleterie from "@/components/LayoutBilleterie";
import { useAuth } from "@/lib/context";
import { useBilleterie } from "@/lib/billeterie-context";
import { Depart, Ticket, ModePaiement } from "@/data/types";
import QRCodeSVG from "react-qr-code";

export default function AgentPage() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getDepartsByOperateur,
    getLignesByOperateur,
    getLigneById,
    getOperateurById,
    creerTicket,
    validerTicket,
    getTicketsByOperateur,
    getTicketByCode,
  } = useBilleterie();

  // Vérifier que l'utilisateur est bien un agent, sinon rediriger
  useEffect(() => {
    if (userBilleterie && userBilleterie.role !== "AGENT") {
      const defaultRoutes: Record<string, string> = {
        CLIENT: "/client?view=search",
        ADMIN_OPERATEUR: "/admin?view=dashboard",
        MINISTERE: "/ministere?view=dashboard",
      };
      const targetRoute = defaultRoutes[userBilleterie.role] || "/login-simule";
      window.location.href = targetRoute;
    }
  }, [userBilleterie]);
  const viewParam = searchParams.get("view") as "dashboard" | "vente" | "controle" | "historique" | null;
  const [view, setView] = useState<"dashboard" | "vente" | "controle" | "historique">(viewParam || "dashboard");
  const [loading, setLoading] = useState(false);

  // Synchroniser avec l'URL
  useEffect(() => {
    if (viewParam && ["dashboard", "vente", "controle", "historique"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "dashboard" | "vente" | "controle" | "historique") => {
    setView(newView);
    router.push(`/agent?view=${newView}`, { scroll: false });
  };
  const [selectedDepart, setSelectedDepart] = useState<Depart | null>(null);
  const [clientNom, setClientNom] = useState<string>("");
  const [clientNumero, setClientNumero] = useState<string>("");
  const [nombrePlaces, setNombrePlaces] = useState<number>(1);
  const [modePaiement, setModePaiement] = useState<ModePaiement>("CASH");
  const [codeTicketControle, setCodeTicketControle] = useState<string>("");
  const [ticketControle, setTicketControle] = useState<Ticket | null>(null);
  const [historiqueTickets, setHistoriqueTickets] = useState<Ticket[]>([]);
  const [filtreDate, setFiltreDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const operateurId = userBilleterie?.operateurId;
  const operateur = operateurId ? getOperateurById(operateurId) : null;

  const departs = useMemo(() => {
    if (!operateurId) return [];
    return getDepartsByOperateur(operateurId).filter(
      (d) => d.statut === "PLANIFIE" || d.statut === "EN_COURS"
    ).sort((a, b) =>
      new Date(a.dateHeureDepart).getTime() - new Date(b.dateHeureDepart).getTime()
    );
  }, [operateurId]);

  const stats = useMemo(() => {
    if (!operateurId) return { ticketsVendus: 0, revenus: 0, departsEnCours: 0, tauxRemplissage: 0 };

    const aujourdhui = new Date().toISOString().split("T")[0];
    const ticketsOperateur = getTicketsByOperateur(operateurId);
    const ticketsAujourdhui = ticketsOperateur.filter(
      (t) => t.dateAchat.startsWith(aujourdhui)
    );

    const ticketsVendus = ticketsAujourdhui.length;
    const revenus = ticketsAujourdhui.reduce((sum, t) => sum + t.prixPaye, 0);
    const departsEnCours = departs.filter((d) => d.statut === "EN_COURS").length;

    const tauxRemplissage = departs.length > 0
      ? departs.reduce((sum, d) => sum + (d.nombrePlacesVendues / d.nombrePlacesTotal) * 100, 0) / departs.length
      : 0;

    return { ticketsVendus, revenus, departsEnCours, tauxRemplissage: Math.round(tauxRemplissage) };
  }, [operateurId, departs]);

  useEffect(() => {
    if (operateurId) {
      const tickets = getTicketsByOperateur(operateurId).filter((t) => {
        const dateAchat = new Date(t.dateAchat).toISOString().split("T")[0];
        return dateAchat === filtreDate;
      });
      setHistoriqueTickets(tickets);
    }
  }, [operateurId, filtreDate]);

  const handleVendreTicket = (depart: Depart) => {
    setSelectedDepart(depart);
    updateView("vente");
  };

  const handleConfirmVente = () => {
    if (!selectedDepart || !clientNom || !clientNumero || !userBilleterie) return;

    setLoading(true);
    setTimeout(() => {
      try {
        const nouveauxTickets = creerTicket(
          clientNom,
          clientNumero,
          selectedDepart.id,
          nombrePlaces,
          "AGENT_POS",
          modePaiement,
          userBilleterie.id
        );

        alert(`✅ ${nouveauxTickets.length} ticket(s) vendu(s) avec succès !`);
        setClientNom("");
        setClientNumero("");
        setNombrePlaces(1);
        setSelectedDepart(null);
        setLoading(false);
        updateView("dashboard");
      } catch (error: any) {
        setLoading(false);
        alert(`❌ Erreur : ${error.message}`);
      }
    }, 500);
  };

  const handleControleTicket = () => {
    if (!codeTicketControle) return;

    const ticket = getTicketByCode(codeTicketControle.trim().toUpperCase());
    setTicketControle(ticket || null);
  };

  const handleValiderTicket = () => {
    if (!codeTicketControle) return;

    const success = validerTicket(codeTicketControle.trim().toUpperCase());
    if (success) {
      alert("✅ Ticket validé avec succès !");
      const ticket = getTicketByCode(codeTicketControle.trim().toUpperCase());
      setTicketControle(ticket || null);
    } else {
      alert("❌ Impossible de valider ce ticket (déjà utilisé ou invalide)");
    }
  };

  // Si l'utilisateur n'est pas un agent, ne rien afficher (la redirection est gérée dans useEffect)
  if (userBilleterie && userBilleterie.role !== "AGENT") {
    return (
      <LayoutBilleterie>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033A0] mx-auto mb-4"></div>
            <p className="text-slate-600">Redirection en cours...</p>
          </div>
        </div>
      </LayoutBilleterie>
    );
  }

  if (!userBilleterie || !operateur) {
    return (
      <LayoutBilleterie>
        <div className="text-center py-12">
          <p className="text-slate-600">Veuillez vous connecter en tant qu'agent</p>
        </div>
      </LayoutBilleterie>
    );
  }

  return (
    <LayoutBilleterie>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[#0033A0]">Espace Agent - {operateur.nom}</h1>
          <p className="text-slate-500 text-sm mt-1">Vente rapide et contrôle des tickets</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "vente", label: "Vente rapide", icon: "🎫" },
            { id: "controle", label: "Contrôle", icon: "✓" },
            { id: "historique", label: "Historique", icon: "📋" },
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
                { label: "Tickets vendus (aujourd'hui)", value: stats.ticketsVendus, icon: "🎫", color: "#0033A0" },
                { label: "Revenus du jour", value: `${stats.revenus.toLocaleString("fr-FR")} FC`, icon: "💰", color: "#10b981" },
                { label: "Départs en cours", value: stats.departsEnCours, icon: "🚌", color: "#FFD200" },
                { label: "Taux de remplissage", value: `${stats.tauxRemplissage}%`, icon: "📊", color: "#8b5cf6" },
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

            {/* Prochains départs */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
              <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Prochains départs</h2>
              {departs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Aucun départ prévu</p>
              ) : (
                <div className="space-y-3">
                  {departs.slice(0, 5).map((dep) => {
                    const ligne = getLigneById(dep.ligneId);
                    const placesDisponibles = dep.nombrePlacesTotal - dep.nombrePlacesVendues;
                    return (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0033A0]">{ligne?.nom || "Ligne inconnue"}</h3>
                          <p className="text-sm text-slate-600">
                            {new Date(dep.dateHeureDepart).toLocaleString("fr-FR")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {placesDisponibles} place(s) disponible(s) • {dep.prix.toLocaleString("fr-FR")} FC
                          </p>
                        </div>
                        <button
                          onClick={() => handleVendreTicket(dep)}
                          className="px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-all font-medium active:scale-95 hover:scale-105"
                        >
                          Vendre
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vente rapide */}
        {view === "vente" && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg max-w-2xl mx-auto animate-slide-in">
            <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Vente rapide</h2>

            {selectedDepart && (() => {
              const ligne = getLigneById(selectedDepart.ligneId);
              return (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">{ligne?.nom || "Ligne inconnue"}</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(selectedDepart.dateHeureDepart).toLocaleString("fr-FR")}
                  </p>
                  <p className="text-lg font-bold text-[#0033A0] mt-2">
                    {selectedDepart.prix.toLocaleString("fr-FR")} FC par place
                  </p>
                </div>
              );
            })()}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du client</label>
                <input
                  type="text"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={clientNumero}
                  onChange={(e) => setClientNumero(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de places</label>
                <select
                  value={nombrePlaces}
                  onChange={(e) => setNombrePlaces(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mode de paiement</label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                >
                  <option value="CASH">Espèces</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
              {selectedDepart && (
                <div className="bg-gradient-to-r from-[#0033A0]/10 to-[#FFD200]/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-[#0033A0]">
                      {(selectedDepart.prix * nombrePlaces).toLocaleString("fr-FR")} FC
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedDepart(null);
                            updateView("dashboard");
                          }}
                          className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all active:scale-95 hover:scale-105"
                        >
                          Annuler
                        </button>
                <button
                  onClick={handleConfirmVente}
                  disabled={!clientNom || !clientNumero || !selectedDepart || loading}
                  className="flex-1 px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>En cours...</span>
                    </>
                  ) : (
                    "Confirmer la vente"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contrôle */}
        {view === "controle" && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg max-w-2xl mx-auto animate-slide-in">
            <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Contrôle / Validation de ticket</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code ticket / Scanner simulé</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeTicketControle}
                    onChange={(e) => setCodeTicketControle(e.target.value)}
                    placeholder="Ex: TRA-00000001"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    onKeyPress={(e) => e.key === "Enter" && handleControleTicket()}
                  />
                  <button
                  onClick={handleControleTicket}
                  className="px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-all font-medium active:scale-95 hover:scale-105"
                >
                  Rechercher
                </button>
                </div>
              </div>
            </div>

            {ticketControle ? (() => {
              const ligne = getLigneById(ticketControle.ligneId);
              const depart = getDepartsByOperateur(operateurId || "").find((d) => d.id === ticketControle.departId);

              return (
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#0033A0] text-lg">{ticketControle.codeTicket}</h3>
                      <p className="text-sm text-slate-600">{ligne?.nom || "Ligne inconnue"}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticketControle.statut === "VALIDE"
                          ? "bg-green-100 text-green-700"
                          : ticketControle.statut === "UTILISE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ticketControle.statut}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Client</p>
                      <p className="font-medium">{ticketControle.clientNom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Téléphone</p>
                      <p className="font-medium">{ticketControle.clientNumero}</p>
                    </div>
                    {depart && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Date de départ</p>
                        <p className="font-medium">{new Date(depart.dateHeureDepart).toLocaleString("fr-FR")}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500">Prix payé</p>
                      <p className="font-medium">{ticketControle.prixPaye.toLocaleString("fr-FR")} FC</p>
                    </div>
                  </div>

                  {ticketControle.statut === "VALIDE" && (
                    <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                      <QRCodeSVG value={ticketControle.codeTicket} size={150} />
                    </div>
                  )}

                  {ticketControle.statut === "VALIDE" && (
                    <button
                      onClick={handleValiderTicket}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:scale-105 active:scale-95"
                    >
                      ✓ Valider l'embarquement
                    </button>
                  )}

                  {ticketControle.statut !== "VALIDE" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-700 font-medium">
                        {ticketControle.statut === "UTILISE"
                          ? "⚠️ Ce ticket a déjà été utilisé"
                          : "❌ Ce ticket a été annulé"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })() : codeTicketControle ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-700 font-medium">❌ Ticket inconnu</p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 text-center">
                <p className="text-slate-500">Entrez un code ticket pour commencer</p>
              </div>
            )}
          </div>
        )}

        {/* Historique */}
        {view === "historique" && (
          <div className="space-y-4 animate-slide-in">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Filtrer par date</label>
              <input
                type="date"
                value={filtreDate}
                onChange={(e) => setFiltreDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
              />
            </div>

            {historiqueTickets.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                <p className="text-slate-500">Aucune vente pour cette date</p>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Ventes du {new Date(filtreDate).toLocaleDateString("fr-FR")}</h2>
                <div className="space-y-3">
                  {historiqueTickets.map((ticket) => {
                    const ligne = getLigneById(ticket.ligneId);
                    return (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-[#0033A0]">{ticket.codeTicket}</p>
                          <p className="text-sm text-slate-600">{ligne?.nom || "Ligne inconnue"}</p>
                          <p className="text-xs text-slate-500">{ticket.clientNom} • {ticket.clientNumero}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0033A0]">{ticket.prixPaye.toLocaleString("fr-FR")} FC</p>
                          <p className="text-xs text-slate-500">{new Date(ticket.dateAchat).toLocaleTimeString("fr-FR")}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.statut === "VALIDE" ? "bg-green-100 text-green-700" :
                            ticket.statut === "UTILISE" ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {ticket.statut}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutBilleterie>
  );
}

