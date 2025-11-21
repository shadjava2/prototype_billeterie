"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LayoutBilleterie from "@/components/LayoutBilleterie";
import { useAuth } from "@/lib/context";
import { useBilleterie } from "@/lib/billeterie-context";
import { Depart, Ligne, Ticket, ModePaiement } from "@/data/types";
import QRCodeSVG from "react-qr-code";
import PaymentModal from "@/components/PaymentModal";

function ClientContent() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getLignes,
    getDeparts,
    getDepartsByCodeBus,
    getDepartsByLigne,
    getLigneById,
    getOperateurById,
    getTicketsByClient,
    creerTicket,
  } = useBilleterie();

  // Vérifier que l'utilisateur est bien un client, sinon rediriger
  useEffect(() => {
    if (userBilleterie && userBilleterie.role !== "CLIENT") {
      const defaultRoutes: Record<string, string> = {
        AGENT: "/agent?view=dashboard",
        ADMIN_OPERATEUR: "/admin?view=dashboard",
        MINISTERE: "/ministere?view=dashboard",
      };
      const targetRoute = defaultRoutes[userBilleterie.role] || "/login-simule";
      window.location.href = targetRoute;
    }
  }, [userBilleterie]);

  // Protection : rediriger si l'utilisateur n'est pas un client
  useEffect(() => {
    if (userBilleterie && userBilleterie.role !== "CLIENT") {
      const routes: Record<string, string> = {
        AGENT: "/agent?view=dashboard",
        ADMIN_OPERATEUR: "/admin?view=dashboard",
        MINISTERE: "/ministere?view=dashboard",
      };
      const targetRoute = routes[userBilleterie.role] || "/login-simule";
      router.push(targetRoute);
    }
  }, [userBilleterie, router]);
  const viewParam = searchParams.get("view") as "search" | "results" | "booking" | "myTickets" | "reservation" | null;

  // Initialiser la vue avec le paramètre URL ou "search" par défaut
  const [view, setView] = useState<"search" | "results" | "booking" | "myTickets" | "reservation">(
    (viewParam && ["search", "results", "booking", "myTickets", "reservation"].includes(viewParam))
      ? viewParam
      : "search"
  );

  // Synchroniser avec l'URL quand le paramètre change depuis l'extérieur (sidebar, etc.)
  useEffect(() => {
    if (viewParam && ["search", "results", "booking", "myTickets", "reservation"].includes(viewParam)) {
      if (view !== viewParam) {
        setView(viewParam);
        // Réinitialiser les états lors du changement de vue
        if (viewParam === "search") {
          setCodeBus("");
          setResults([]);
          setSelectedDepart(null);
        } else if (viewParam === "reservation") {
          setSelectedLigne(null);
          setSelectedModeTransport(null);
          setDepartsDisponibles([]);
          setDepartReserve(null);
        }
      }
    } else if (!viewParam && view !== "search") {
      // Si pas de paramètre view, utiliser "search" par défaut
      setView("search");
    }
  }, [viewParam, view]);

  const updateView = (newView: "search" | "results" | "booking" | "myTickets" | "reservation") => {
    // Mettre à jour l'état local immédiatement
    setView(newView);
    // Mettre à jour l'URL avec le router Next.js
    router.push(`/client?view=${newView}`, { scroll: false });
  };
  const [codeBus, setCodeBus] = useState<string>("");
  const [results, setResults] = useState<Depart[]>([]);
  const [selectedDepart, setSelectedDepart] = useState<Depart | null>(null);
  const [loading, setLoading] = useState(false);

  // États pour la réservation
  const [selectedLigne, setSelectedLigne] = useState<Ligne | null>(null);
  const [selectedModeTransport, setSelectedModeTransport] = useState<"BUS" | "TRAIN" | "BATEAU" | null>(null);
  const [departsDisponibles, setDepartsDisponibles] = useState<Depart[]>([]);
  const [departReserve, setDepartReserve] = useState<Depart | null>(null);

  // État pour la réservation
  const [clientNom, setClientNom] = useState<string>("");
  const [clientNumero, setClientNumero] = useState<string>("");
  const [nombrePlaces, setNombrePlaces] = useState<number>(1);
  const [modePaiement, setModePaiement] = useState<ModePaiement>("MOBILE_MONEY");
  const [ticketsAchetes, setTicketsAchetes] = useState<Ticket[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mes tickets
  const [mesTickets, setMesTickets] = useState<Ticket[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<"all" | "VALIDE" | "UTILISE" | "ANNULE">("all");

  useEffect(() => {
    if (userBilleterie && userBilleterie.role === "CLIENT" && clientNumero) {
      const tickets = getTicketsByClient(clientNumero);
      setMesTickets(tickets);
    }
  }, [userBilleterie, clientNumero]);

  const handleSearch = (codeBusRecherche?: string) => {
    const codeRecherche = codeBusRecherche || codeBus.trim();

    if (!codeRecherche) {
      alert("❌ Veuillez entrer un ID de bus");
      return;
    }

    setLoading(true);

    // Vérifier que la fonction existe
    if (!getDepartsByCodeBus) {
      console.error("❌ getDepartsByCodeBus n'est pas défini");
      alert("❌ Erreur: Le service de recherche n'est pas disponible. Veuillez rafraîchir la page.");
      setLoading(false);
      return;
    }

    // Utiliser requestAnimationFrame pour s'assurer que le contexte est prêt
    requestAnimationFrame(() => {
      try {
        console.log(`🔍 Début de la recherche pour: "${codeRecherche}"`);
        // Recherche par codeBus
        const departsTrouves = getDepartsByCodeBus(codeRecherche);

        if (!departsTrouves || !Array.isArray(departsTrouves)) {
          console.error("❌ getDepartsByCodeBus n'a pas retourné un tableau:", departsTrouves);
          setResults([]);
          setLoading(false);
          updateView("results");
          return;
        }

        // Debug: vérifier ce qui est trouvé
        console.log(`🔍 Recherche pour "${codeRecherche}":`, departsTrouves.length, "départs trouvés");
        if (departsTrouves.length > 0) {
          console.log("📋 Détails des départs trouvés:", departsTrouves.map(d => ({
            id: d.id,
            codeBus: d.codeBus,
            statut: d.statut,
            dateDepart: d.dateHeureDepart,
            placesTotal: d.nombrePlacesTotal,
            placesVendues: d.nombrePlacesVendues,
            placesReservees: d.nombrePlacesReservees || 0
          })));
        }

        // Ne garder que les départs planifiés et disponibles (avec date future)
        const maintenant = new Date();
        maintenant.setHours(maintenant.getHours() - 2); // Marge de 2 heures pour les départs du jour

        const filtered = departsTrouves.filter((d) => {
          const dateDepart = new Date(d.dateHeureDepart);
          // Calculer les places disponibles : total - vendues (les réservations peuvent être annulées)
          const placesDisponibles = d.nombrePlacesTotal - d.nombrePlacesVendues;
          const isAvailable = (
            d.statut === "PLANIFIE" &&
            placesDisponibles > 0 &&
            dateDepart > maintenant
          );

          if (!isAvailable && departsTrouves.length > 0) {
            console.log(`Départ ${d.codeBus} filtré:`, {
              statut: d.statut,
              placesTotal: d.nombrePlacesTotal,
              placesVendues: d.nombrePlacesVendues,
              placesDisponibles,
              dateDepart: dateDepart.toISOString(),
              maintenant: maintenant.toISOString(),
              dateFuture: dateDepart > maintenant
            });
          }

          return isAvailable;
        });

        console.log(`✅ Départs disponibles après filtrage:`, filtered.length);

        setResults(filtered.sort((a, b) =>
          new Date(a.dateHeureDepart).getTime() - new Date(b.dateHeureDepart).getTime()
        ));
        setLoading(false);
        updateView("results");
      } catch (error) {
        console.error("❌ Erreur lors de la recherche:", error);
        alert("❌ Erreur lors de la recherche. Veuillez réessayer.");
        setLoading(false);
      }
    });
  };

  const handleBuy = (depart: Depart) => {
    setSelectedDepart(depart);
    updateView("booking");
  };

  const handleConfirmBooking = () => {
    if (!selectedDepart || !clientNom || !clientNumero) {
      alert("❌ Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Vérifier que le mode de paiement n'est pas CASH pour les clients
    if (modePaiement === "CASH") {
      alert("❌ Le paiement en espèces n'est disponible qu'aux guichets. Veuillez choisir Mobile Money ou Carte bancaire.");
      return;
    }

    // Ouvrir le modal de paiement
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    if (!selectedDepart || !clientNom || !clientNumero) {
      alert("❌ Erreur : Données manquantes");
      setShowPaymentModal(false);
      return;
    }

    // Sauvegarder les valeurs avant reset
    const departTemp = selectedDepart;
    const nombrePlacesTemp = nombrePlaces;
    const modePaiementTemp = modePaiement;

    try {
      const nouveauxTickets = creerTicket(
        clientNom,
        clientNumero,
        selectedDepart.id,
        nombrePlaces,
        "WEB",
        modePaiement
      );

      // Mettre à jour les états
      setTicketsAchetes(nouveauxTickets);
      setMesTickets((prev) => [...prev, ...nouveauxTickets]);
      setShowPaymentModal(false);

      // Reset form après succès
      setClientNom("");
      setClientNumero("");
      setNombrePlaces(1);
      setSelectedDepart(null);

      // Rediriger vers la vue des tickets
      setTimeout(() => {
        updateView("myTickets");

        // Afficher le message de succès avec les détails
        setTimeout(() => {
          const montantPaye = paymentData.amount || departTemp.prix * nombrePlacesTemp;
          alert(`✅ ${nouveauxTickets.length} ticket(s) acheté(s) avec succès !\n\nTransaction ID: ${paymentData.transactionId || "N/A"}\nMontant: ${montantPaye.toLocaleString("fr-FR")} FC\nMode de paiement: ${modePaiementTemp === "MOBILE_MONEY" ? "Mobile Money" : "Carte bancaire"}`);
        }, 500);
      }, 300);
    } catch (error: any) {
      console.error("Erreur lors de la création du ticket:", error);
      alert(`❌ Erreur : ${error.message || "Une erreur est survenue lors de la création du ticket"}`);
      setShowPaymentModal(false);
    }
  };


  const ticketsFiltres = filtreStatut === "all"
    ? mesTickets
    : mesTickets.filter((t) => t.statut === filtreStatut);

  // Si l'utilisateur n'est pas un client, ne rien afficher (la redirection est gérée dans useEffect)
  if (userBilleterie && userBilleterie.role !== "CLIENT") {
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

  return (
    <LayoutBilleterie>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#0033A0]">Espace Client</h1>
            <p className="text-slate-500 text-sm mt-1">Recherchez et achetez vos tickets de transport</p>
          </div>
              <button
                onClick={() => updateView("myTickets")}
                className="px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                Mes Tickets
              </button>
        </div>

        {/* Vue Recherche */}
        {view === "search" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-8 animate-slide-in">
              <div className="inline-block mb-4 animate-bounce-slow">
                <div className="text-6xl">🚌</div>
              </div>
              <h1 className="text-4xl font-bold text-[#0033A0] mb-3 bg-gradient-to-r from-[#0033A0] to-[#002280] bg-clip-text text-transparent">
                Recherche d'Itinéraires
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Trouvez rapidement les horaires et disponibilités de votre bus en saisissant son code d'identification
              </p>
            </div>

            {/* Carte principale de recherche */}
            <div className="bg-white/95 backdrop-blur-md border-2 border-slate-200/80 rounded-2xl p-8 shadow-modern-xl hover:shadow-colored transition-all duration-300">
              <div className="space-y-6">
                {/* Champ de recherche amélioré */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🚌</span>
                    <span className="text-lg">Code d'Identification du Bus</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={codeBus}
                      onChange={(e) => setCodeBus(e.target.value.toUpperCase())}
                      placeholder="Ex: BUS-TSC-003"
                      className="w-full px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-2 border-slate-300 rounded-xl text-xl font-mono focus:outline-none focus:ring-4 focus:ring-[#0033A0]/20 focus:border-[#0033A0] transition-all shadow-inner hover:shadow-md"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && codeBus.trim()) {
                          handleSearch(codeBus.trim());
                        }
                      }}
                      autoFocus
                    />
                    {codeBus && (
                      <button
                        onClick={() => setCodeBus("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <span>💡</span>
                    <span>Le code est généralement affiché sur le côté du véhicule (ex: BUS-TSC-003, BUS-TSC-004)</span>
                  </p>
                </div>

                {/* Bouton de recherche amélioré */}
                <button
                  onClick={() => handleSearch()}
                  disabled={loading || !codeBus.trim()}
                  className="w-full px-8 py-5 bg-gradient-to-r from-[#0033A0] via-[#002280] to-[#0033A0] text-white rounded-xl hover:from-[#002280] hover:via-[#0033A0] hover:to-[#002280] transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/30 border-t-white"></div>
                        <span>Recherche en cours...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">🔍</span>
                        <span>Rechercher les Itinéraires</span>
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                </button>
              </div>
            </div>

            {/* Section des codes de démonstration améliorée */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300/50 rounded-2xl p-6 shadow-modern-lg animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl animate-bounce-slow">💡</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-1">Codes Bus de Démonstration</h3>
                  <p className="text-sm text-blue-700">Cliquez sur un code pour rechercher automatiquement ses itinéraires disponibles</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {["BUS-TSC-003", "BUS-TSC-004", "BUS-TSC-102", "BUS-TSC-201", "BUS-TAE-001"].map((code, index) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCodeBus(code);
                      handleSearch(code);
                    }}
                    className="px-4 py-3 bg-white/90 hover:bg-white border-2 border-blue-400 hover:border-blue-600 text-blue-900 rounded-xl text-sm font-mono font-bold transition-all hover:scale-110 active:scale-95 shadow-md hover:shadow-lg hover:-translate-y-1 animate-fade-in group relative overflow-hidden"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <span className="relative z-10">{code}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-white/60 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <span><strong>Astuce :</strong> Tous ces codes bus ont plusieurs itinéraires disponibles avec des horaires variés</span>
                </p>
              </div>
            </div>

            {/* Section d'informations utiles */}
            <div className="grid md:grid-cols-3 gap-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all hover:scale-105">
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-semibold text-green-900 mb-1">Réservation Rapide</h4>
                <p className="text-xs text-green-700">Achetez vos billets en quelques clics</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-all hover:scale-105">
                <div className="text-2xl mb-2">⏰</div>
                <h4 className="font-semibold text-purple-900 mb-1">Horaires en Temps Réel</h4>
                <p className="text-xs text-purple-700">Consultez les départs disponibles</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all hover:scale-105">
                <div className="text-2xl mb-2">💳</div>
                <h4 className="font-semibold text-orange-900 mb-1">Paiement Sécurisé</h4>
                <p className="text-xs text-orange-700">Plusieurs modes de paiement disponibles</p>
              </div>
            </div>
          </div>
        )}

        {/* Vue Résultats */}
        {view === "results" && (
          <div className="space-y-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setCodeBus("");
                  setResults([]);
                  updateView("search");
                }}
                className="text-[#0033A0] hover:text-[#002280] font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 hover:translate-x-[-4px] group"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span> Nouvelle recherche
              </button>
              {codeBus && (
                <div className="bg-[#0033A0]/10 px-4 py-2 rounded-lg">
                  <span className="text-sm text-slate-600">Bus recherché: </span>
                  <span className="font-mono font-semibold text-[#0033A0]">{codeBus}</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="relative inline-block">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0033A0]/20 border-t-[#0033A0]"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-[#0033A0]/30"></div>
                </div>
                <p className="mt-6 text-slate-600 font-medium animate-pulse">Recherche en cours...</p>
                <div className="mt-4 flex gap-2 justify-center">
                  <div className="w-2 h-2 bg-[#0033A0] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-[#0033A0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#0033A0] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-12 text-center animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce-slow inline-block">🚌</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2 animate-slide-in">Aucun itinéraire disponible</h3>
                <p className="text-slate-600 mb-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
                  Aucun départ planifié trouvé pour le bus <span className="font-mono font-semibold text-[#0033A0] bg-blue-50 px-2 py-1 rounded">{codeBus}</span>
                </p>
                <p className="text-sm text-slate-500 mb-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  Vérifiez que l'ID du bus est correct ou que le bus a des départs planifiés avec des places disponibles.
                </p>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                  <p className="text-sm font-semibold text-blue-900 mb-3">💡 Essayez ces codes bus de démonstration :</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["BUS-TSC-003", "BUS-TSC-004", "BUS-TSC-102", "BUS-TSC-201", "BUS-TAE-001"].map((code, index) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCodeBus(code);
                          handleSearch(code);
                        }}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-xs font-mono transition-all hover:scale-110 active:scale-95 font-semibold hover:shadow-md animate-fade-in"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gradient-to-r from-[#0033A0]/10 to-[#FFD200]/10 rounded-xl p-4 mb-4 animate-slide-in shadow-modern">
                  <h3 className="text-lg font-semibold text-[#0033A0] mb-1">
                    Itinéraires disponibles pour {codeBus}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {results.length} itinéraire{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((dep, index) => {
                    const ligne = getLigneById(dep.ligneId);
                    const operateur = ligne ? getOperateurById(ligne.operateurId) : null;
                    const placesDisponibles = dep.nombrePlacesTotal - dep.nombrePlacesVendues;
                    const pourcentageRemplissage = (dep.nombrePlacesVendues / dep.nombrePlacesTotal) * 100;

                    return (
                      <div
                        key={dep.id}
                        className="bg-white/90 backdrop-blur-sm border-2 border-slate-200/80 rounded-xl p-6 hover:shadow-modern-xl hover:scale-[1.02] hover:border-[#0033A0]/50 transition-all animate-slide-in hover-lift"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {ligne?.mode}
                              </span>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                {operateur?.nom}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg text-[#0033A0] mb-1">{ligne?.nom || "Ligne inconnue"}</h3>
                            <p className="text-sm text-slate-500 font-mono">{dep.codeBus}</p>
                          </div>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-3 text-sm bg-slate-50 rounded-lg p-3">
                            <span className="text-xl">📍</span>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{ligne?.departPrincipal}</div>
                              <div className="text-xs text-slate-500">→ {ligne?.arriveePrincipale}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm bg-slate-50 rounded-lg p-3">
                            <span className="text-xl">🕐</span>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {new Date(dep.dateHeureDepart).toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                              </div>
                              <div className="text-xs text-slate-500">
                                Départ: {new Date(dep.dateHeureDepart).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm bg-slate-50 rounded-lg p-3">
                            <span className="text-xl">💺</span>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">
                                {placesDisponibles} place{placesDisponibles > 1 ? "s" : ""} disponible{placesDisponibles > 1 ? "s" : ""}
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                <div
                                  className="bg-gradient-to-r from-[#0033A0] to-[#002280] h-2 rounded-full transition-all"
                                  style={{ width: `${pourcentageRemplissage}%` }}
                                />
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {dep.nombrePlacesVendues}/{dep.nombrePlacesTotal} places occupées
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                          <div>
                            <div className="text-xs text-slate-500">Prix par place</div>
                            <span className="text-2xl font-bold text-[#0033A0]">
                              {dep.prix.toLocaleString("fr-FR")} FC
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleBuy(dep);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:scale-105 active:scale-95 transition-all font-semibold shadow-md hover:shadow-lg cursor-pointer hover:shadow-colored relative overflow-hidden group"
                          >
                            <span className="relative z-10">Acheter</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-[#002280] to-[#0033A0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vue Réservation */}
        {view === "booking" && selectedDepart && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg animate-slide-in max-w-2xl mx-auto">
            <button
              onClick={() => updateView("results")}
              className="text-[#0033A0] hover:text-[#002280] font-medium flex items-center gap-2 mb-4 transition-all hover:scale-105 active:scale-95"
            >
              ← Retour aux résultats
            </button>
            <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Finaliser votre réservation</h2>

            {/* Récapitulatif */}
            {(() => {
              const ligne = getLigneById(selectedDepart.ligneId);
              const operateur = ligne ? getOperateurById(ligne.operateurId) : null;
              return (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">{ligne?.nom}</h3>
                  <p className="text-sm text-slate-600 mb-1">
                    {new Date(selectedDepart.dateHeureDepart).toLocaleString("fr-FR")}
                  </p>
                  <p className="text-sm text-slate-600">
                    {ligne?.departPrincipal} → {ligne?.arriveePrincipale}
                  </p>
                  <p className="text-lg font-bold text-[#0033A0] mt-2">
                    {selectedDepart.prix.toLocaleString("fr-FR")} FC par place
                  </p>
                </div>
              );
            })()}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={clientNumero}
                  onChange={(e) => setClientNumero(e.target.value)}
                  placeholder="+243900000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de places</label>
                <select
                  value={nombrePlaces}
                  onChange={(e) => setNombrePlaces(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModePaiement("MOBILE_MONEY")}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      modePaiement === "MOBILE_MONEY"
                        ? "border-[#0033A0] bg-[#0033A0]/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">📱</div>
                    <div className="font-semibold text-slate-900">Mobile Money</div>
                    <div className="text-xs text-slate-500 mt-1">Orange, M-Pesa, Airtel...</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModePaiement("CARTE")}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      modePaiement === "CARTE"
                        ? "border-[#0033A0] bg-[#0033A0]/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">💳</div>
                    <div className="font-semibold text-slate-900">Carte bancaire</div>
                    <div className="text-xs text-slate-500 mt-1">Visa, Mastercard...</div>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Le paiement en espèces est disponible uniquement aux guichets
                </p>
              </div>
              <div className="bg-gradient-to-r from-[#0033A0]/10 to-[#FFD200]/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total à payer</span>
                  <span className="text-2xl font-bold text-[#0033A0]">
                    {(selectedDepart.prix * nombrePlaces).toLocaleString("fr-FR")} FC
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!clientNom || !clientNumero}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all shadow-lg hover:scale-105 active:scale-95 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <span>💳</span>
                <span>Procéder au paiement</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal de paiement */}
        <PaymentModal
          isOpen={showPaymentModal && selectedDepart !== null}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          amount={selectedDepart ? selectedDepart.prix * nombrePlaces : 0}
          modePaiement={modePaiement}
          clientNom={clientNom}
          clientNumero={clientNumero}
        />

        {/* Vue Réservation */}
        {view === "reservation" && (
          <div className="space-y-6 animate-slide-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#0033A0]">Réservation pour Longs Voyages</h1>
                <p className="text-slate-500 text-sm mt-1">Sélectionnez une ligne et réservez pour une heure précise</p>
              </div>
            </div>

            {!selectedLigne ? (
              // Étape 1: Sélection de la ligne
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Sélectionnez une ligne</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getLignes()
                    .filter((l) => l.type === "INTERURBAIN" || l.type === "INTERNATIONAL")
                    .map((ligne) => {
                      const operateur = getOperateurById(ligne.operateurId);
                      return (
                        <button
                          key={ligne.id}
                          onClick={() => setSelectedLigne(ligne)}
                          className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 hover:border-[#0033A0] hover:bg-[#0033A0]/5 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-[#0033A0] group-hover:text-[#002280]">{ligne.nom}</h3>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {ligne.mode}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <span>📍</span>
                              <span>{ligne.departPrincipal} → {ligne.arriveePrincipale}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <span>⏱️</span>
                              <span>Durée: {Math.floor(ligne.dureeMoyenneMinutes / 60)}h {ligne.dureeMoyenneMinutes % 60}min</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <span>🏢</span>
                              <span>{operateur?.nom}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : !selectedModeTransport ? (
              // Étape 2: Sélection du moyen de transport
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSelectedLigne(null);
                    setSelectedModeTransport(null);
                    setDepartsDisponibles([]);
                  }}
                  className="text-[#0033A0] hover:text-[#002280] font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  ← Retour aux lignes
                </button>
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg">
                  <h2 className="text-lg font-semibold text-[#0033A0] mb-2">
                    Moyens de transport disponibles
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Ligne: <span className="font-semibold">{selectedLigne.nom}</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["BUS", "TRAIN", "BATEAU"].map((mode) => {
                      const lignesByMode = getLignes().filter(
                        (l) => l.id === selectedLigne.id && l.mode === mode
                      );
                      const hasMode = selectedLigne.mode === mode;

                      if (!hasMode) return null;

                      const icon = mode === "BUS" ? "🚌" : mode === "TRAIN" ? "🚂" : "⛴️";
                      const description =
                        mode === "BUS"
                          ? "Transport par bus confortable"
                          : mode === "TRAIN"
                          ? "Voyage en train"
                          : "Traversée en bateau";

                      return (
                        <button
                          key={mode}
                          onClick={() => {
                            setSelectedModeTransport(mode as "BUS" | "TRAIN" | "BATEAU");
                            // Charger les départs disponibles pour cette ligne
                            const departs = getDepartsByLigne(selectedLigne.id).filter(
                              (d) =>
                                d.statut === "PLANIFIE" &&
                                d.nombrePlacesVendues < d.nombrePlacesTotal
                            );
                            setDepartsDisponibles(
                              departs.sort(
                                (a, b) =>
                                  new Date(a.dateHeureDepart).getTime() -
                                  new Date(b.dateHeureDepart).getTime()
                              )
                            );
                          }}
                          className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-xl p-6 hover:border-[#0033A0] hover:shadow-lg transition-all text-left group"
                        >
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                            {icon}
                          </div>
                          <h3 className="font-bold text-lg text-[#0033A0] mb-2">{mode}</h3>
                          <p className="text-sm text-slate-600">{description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : !departReserve ? (
              // Étape 3: Sélection de l'heure précise
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSelectedModeTransport(null);
                    setDepartsDisponibles([]);
                    setDepartReserve(null);
                  }}
                  className="text-[#0033A0] hover:text-[#002280] font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  ← Retour aux moyens de transport
                </button>
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg">
                  <h2 className="text-lg font-semibold text-[#0033A0] mb-2">
                    Sélectionnez une heure de départ
                  </h2>
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">Ligne:</span> {selectedLigne.nom}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">Moyen:</span> {selectedModeTransport}
                    </p>
                  </div>
                  {departsDisponibles.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="text-slate-600">Aucun départ disponible pour le moment</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {departsDisponibles.map((dep) => {
                        const placesDisponibles = dep.nombrePlacesTotal - dep.nombrePlacesVendues;
                        const operateur = getOperateurById(selectedLigne.operateurId);
                        const dateDepart = new Date(dep.dateHeureDepart);
                        const dateArrivee = new Date(dep.dateHeureArrivee);

                        return (
                          <button
                            key={dep.id}
                            onClick={() => setDepartReserve(dep)}
                            className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 hover:border-[#0033A0] hover:bg-[#0033A0]/5 transition-all text-left group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-2xl font-bold text-[#0033A0]">
                                {dateDepart.toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                {placesDisponibles} places
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span>📅</span>
                                <span>
                                  {dateDepart.toLocaleDateString("fr-FR", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <span>🕐</span>
                                <span>
                                  Arrivée prévue: {dateArrivee.toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <span>🚌</span>
                                <span className="font-mono text-xs">{dep.codeBus}</span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                <span className="text-slate-500 text-xs">{operateur?.nom}</span>
                                <span className="text-lg font-bold text-[#0033A0]">
                                  {dep.prix.toLocaleString("fr-FR")} FC
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Étape 4: Formulaire de réservation
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setDepartReserve(null);
                  }}
                  className="text-[#0033A0] hover:text-[#002280] font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  ← Retour aux horaires
                </button>
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg max-w-2xl mx-auto">
                  <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Finaliser votre réservation</h2>

                  {/* Récapitulatif */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2">{selectedLigne.nom}</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Départ:</span>{" "}
                        {new Date(departReserve.dateHeureDepart).toLocaleString("fr-FR")}
                      </p>
                      <p>
                        <span className="font-semibold">Arrivée:</span>{" "}
                        {new Date(departReserve.dateHeureArrivee).toLocaleString("fr-FR")}
                      </p>
                      <p>
                        <span className="font-semibold">Moyen:</span> {selectedModeTransport}
                      </p>
                      <p>
                        <span className="font-semibold">Bus:</span>{" "}
                        <span className="font-mono">{departReserve.codeBus}</span>
                      </p>
                      <p className="text-lg font-bold text-[#0033A0] mt-2">
                        {departReserve.prix.toLocaleString("fr-FR")} FC par place
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={clientNom}
                        onChange={(e) => setClientNom(e.target.value)}
                        placeholder="Votre nom"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        value={clientNumero}
                        onChange={(e) => setClientNumero(e.target.value)}
                        placeholder="+243900000000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre de places
                      </label>
                      <select
                        value={nombrePlaces}
                        onChange={(e) => setNombrePlaces(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mode de paiement
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setModePaiement("MOBILE_MONEY")}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            modePaiement === "MOBILE_MONEY"
                              ? "border-[#0033A0] bg-[#0033A0]/10"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">📱</div>
                          <div className="font-semibold text-slate-900">Mobile Money</div>
                          <div className="text-xs text-slate-500 mt-1">Orange, M-Pesa, Airtel...</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setModePaiement("CARTE")}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            modePaiement === "CARTE"
                              ? "border-[#0033A0] bg-[#0033A0]/10"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">💳</div>
                          <div className="font-semibold text-slate-900">Carte bancaire</div>
                          <div className="text-xs text-slate-500 mt-1">Visa, Mastercard...</div>
                        </button>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-[#0033A0]/10 to-[#FFD200]/10 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total à payer</span>
                        <span className="text-2xl font-bold text-[#0033A0]">
                          {(departReserve.prix * nombrePlaces).toLocaleString("fr-FR")} FC
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDepart(departReserve);
                        handleConfirmBooking();
                      }}
                      disabled={!clientNom || !clientNumero}
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all shadow-lg hover:scale-105 active:scale-95 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      <span>📅</span>
                      <span>Réserver maintenant</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mes Tickets */}
        {view === "myTickets" && (
          <div className="space-y-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <button
                onClick={() => updateView("search")}
                className="text-[#0033A0] hover:text-[#002280] font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                ← Retour à la recherche
              </button>
              <div className="flex gap-2">
                {(["all", "VALIDE", "UTILISE", "ANNULE"] as const).map((statut) => (
                  <button
                    key={statut}
                    onClick={() => setFiltreStatut(statut)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all active:scale-95 hover:scale-105 ${
                      filtreStatut === statut
                        ? "bg-gradient-to-r from-[#0033A0] to-[#002280] text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {statut === "all" ? "Tous" : statut}
                  </button>
                ))}
              </div>
            </div>
            {ticketsFiltres.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">🎫</div>
                <p className="text-slate-600">Aucun ticket trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticketsFiltres.map((ticket) => {
                  const ligne = getLigneById(ticket.ligneId);
                  const depart = getDeparts().find((d) => d.id === ticket.departId);
                  return (
                    <div
                      key={ticket.id}
                      className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 hover:shadow-modern-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-[#0033A0]">{ligne?.nom || "Ligne inconnue"}</h3>
                          <p className="text-sm text-slate-600">{ticket.codeTicket}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            ticket.statut === "VALIDE"
                              ? "bg-green-100 text-green-700"
                              : ticket.statut === "UTILISE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ticket.statut}
                        </span>
                      </div>
                      {depart && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span>🕐</span>
                            <span>{new Date(depart.dateHeureDepart).toLocaleString("fr-FR")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>💰</span>
                            <span>{ticket.prixPaye.toLocaleString("fr-FR")} FC</span>
                          </div>
                        </div>
                      )}
                      {ticket.statut === "VALIDE" && (
                        <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-center">
                          <QRCodeSVG value={ticket.codeTicket} size={150} />
                        </div>
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

export default function ClientPage() {
  return (
    <Suspense fallback={
      <LayoutBilleterie>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033A0]"></div>
        </div>
      </LayoutBilleterie>
    }>
      <ClientContent />
    </Suspense>
  );
}

