"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { Ligne, Depart, Ticket, Operateur, Agent } from "@/data/types";
import { operateurs as operateursInit, agents as agentsInit, lignes as lignesInit, departs as departsInit, tickets as ticketsInit, genererDeparts } from "@/data/billeterie";

interface BilleterieContextType {
  // Données
  operateurs: Operateur[];
  agents: Agent[];
  lignes: Ligne[];
  departs: Depart[];
  tickets: Ticket[];

  // Fonctions pour les lignes
  creerLigne: (
    operateurId: string,
    code: string,
    nom: string,
    type: "URBAIN" | "INTERURBAIN" | "INTERNATIONAL",
    mode: "BUS" | "TRAIN" | "BATEAU" | "AVION",
    departPrincipal: string,
    arriveePrincipale: string,
    dureeMoyenneMinutes: number,
    prix: number
  ) => Ligne;

  // Fonctions pour les départs
  creerDepart: (
    ligneId: string,
    codeBus: string,
    dateHeureDepart: string,
    nombrePlacesTotal: number,
    nombrePlacesReservees?: number,
    disponiblePourAchatImmediat?: boolean
  ) => Depart;
  mettreAJourStatutDepart: (departId: string, statut: "PLANIFIE" | "EN_COURS" | "TERMINE" | "ANNULE") => void;

  // Fonctions pour les tickets
  creerTicket: (
    clientNom: string,
    clientNumero: string,
    departId: string,
    nombrePlaces: number,
    canalAchat: "WEB" | "AGENT_POS",
    modePaiement: "CASH" | "MOBILE_MONEY" | "CARTE",
    agentId?: string
  ) => Ticket[];

  validerTicket: (codeTicket: string) => boolean;
  annulerTicket: (codeTicket: string) => boolean;

  // Fonctions utilitaires
  getLigneById: (id: string) => Ligne | undefined;
  getDepartById: (id: string) => Depart | undefined;
  getTicketByCode: (code: string) => Ticket | undefined;
  getOperateurById: (id: string) => Operateur | undefined;
  getLignesByOperateur: (operateurId: string) => Ligne[];
  getDepartsByOperateur: (operateurId: string) => Depart[];
  getDepartsByLigne: (ligneId: string) => Depart[];
  getDepartsByCodeBus: (codeBus: string) => Depart[];
  getTicketsByClient: (clientNumero: string) => Ticket[];
  getTicketsByOperateur: (operateurId: string) => Ticket[];
  getLignes: () => Ligne[];
  getDeparts: () => Depart[];
}

const BilleterieContext = createContext<BilleterieContextType | undefined>(undefined);

export function BilleterieProvider({ children }: { children: ReactNode }) {
  const [operateurs] = useState<Operateur[]>(operateursInit);
  const [agents] = useState<Agent[]>(agentsInit);
  const [lignes, setLignes] = useState<Ligne[]>(lignesInit);
  // Générer les départs dynamiquement pour avoir des dates toujours futures
  // Stocker les départs ajoutés dynamiquement séparément
  const [departsAjoutes, setDepartsAjoutes] = useState<Depart[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>(ticketsInit);

  // Fonction helper pour obtenir tous les départs (base + ajoutés)
  const getAllDeparts = (): Depart[] => {
    try {
      if (!genererDeparts) {
        console.error("❌ genererDeparts n'est pas défini");
        return departsAjoutes;
      }
      const departsBase = genererDeparts();
      if (!Array.isArray(departsBase)) {
        console.error("❌ genererDeparts n'a pas retourné un tableau:", departsBase);
        return departsAjoutes;
      }
      const result = [...departsBase, ...departsAjoutes];
      console.log(`📊 getAllDeparts: ${departsBase.length} de base + ${departsAjoutes.length} ajoutés = ${result.length} total`);
      return result;
    } catch (error) {
      console.error("❌ Erreur dans getAllDeparts:", error);
      return departsAjoutes;
    }
  };

  // Fonction helper pour générer un code ticket
  const genererCodeTicket = (operateurId: string, index: number): string => {
    const prefix = operateurId.substring(0, 3).toUpperCase();
    const numero = String(index).padStart(8, "0");
    return `${prefix}-${numero}`;
  };

  // Créer une ligne
  const creerLigne = (
    operateurId: string,
    code: string,
    nom: string,
    type: "URBAIN" | "INTERURBAIN" | "INTERNATIONAL",
    mode: "BUS" | "TRAIN" | "BATEAU" | "AVION",
    departPrincipal: string,
    arriveePrincipale: string,
    dureeMoyenneMinutes: number,
    prix: number
  ): Ligne => {
    const nouvelleLigne: Ligne = {
      id: `LIG-${String(lignes.length + 1).padStart(3, "0")}`,
      operateurId,
      code,
      nom,
      type,
      mode,
      departPrincipal,
      arriveePrincipale,
      dureeMoyenneMinutes,
      prix,
    };
    setLignes((prev) => [...prev, nouvelleLigne]);
    return nouvelleLigne;
  };

  // Créer un départ
  const creerDepart = (
    ligneId: string,
    codeBus: string,
    dateHeureDepart: string,
    nombrePlacesTotal: number,
    nombrePlacesReservees: number = 0,
    disponiblePourAchatImmediat: boolean = true
  ): Depart => {
    const ligne = lignes.find((l) => l.id === ligneId);
    if (!ligne) {
      throw new Error("Ligne introuvable");
    }

    const dateDepart = new Date(dateHeureDepart);
    const dateArrivee = new Date(dateDepart);
    dateArrivee.setMinutes(dateArrivee.getMinutes() + ligne.dureeMoyenneMinutes);

    const nouveauDepart: Depart = {
      id: `DEP-${String(Date.now()).slice(-6)}`,
      ligneId,
      codeBus,
      dateHeureDepart: dateDepart.toISOString(),
      dateHeureArrivee: dateArrivee.toISOString(),
      nombrePlacesTotal,
      nombrePlacesVendues: 0,
      nombrePlacesReservees,
      prix: ligne.prix,
      statut: "PLANIFIE",
      disponiblePourAchatImmediat,
    };
    setDepartsAjoutes((prev) => [...prev, nouveauDepart]);
    return nouveauDepart;
  };

  // Créer un ticket
  const creerTicket = (
    clientNom: string,
    clientNumero: string,
    departId: string,
    nombrePlaces: number,
    canalAchat: "WEB" | "AGENT_POS",
    modePaiement: "CASH" | "MOBILE_MONEY" | "CARTE",
    agentId?: string
  ): Ticket[] => {
    const depart = getAllDeparts().find((d) => d.id === departId);
    if (!depart) throw new Error("Départ introuvable");

    const ligne = lignes.find((l) => l.id === depart.ligneId);
    if (!ligne) throw new Error("Ligne introuvable");

    const operateur = operateurs.find((o) => o.id === ligne.operateurId);
    if (!operateur) throw new Error("Opérateur introuvable");

    // Vérifier disponibilité
    const placesDisponibles = depart.nombrePlacesTotal - depart.nombrePlacesVendues;
    if (nombrePlaces > placesDisponibles) {
      throw new Error(`Seulement ${placesDisponibles} place(s) disponible(s)`);
    }

    const nouveauxTickets: Ticket[] = [];
    const dernierIndex = tickets.length;

    for (let i = 0; i < nombrePlaces; i++) {
      const nouveauTicket: Ticket = {
        id: `TKT-${String(dernierIndex + i + 1).padStart(6, "0")}`,
        codeTicket: genererCodeTicket(operateur.id, dernierIndex + i + 1),
        clientNom,
        clientNumero,
        operateurId: operateur.id,
        ligneId: ligne.id,
        departId: depart.id,
        dateAchat: new Date().toISOString(),
        canalAchat,
        modePaiement,
        statut: "VALIDE",
        prixPaye: depart.prix,
        agentId,
      };
      nouveauxTickets.push(nouveauTicket);
    }

    // Mettre à jour les états
    setTickets((prev) => [...prev, ...nouveauxTickets]);
    setDepartsAjoutes((prev) =>
      prev.map((d) =>
        d.id === departId
          ? { ...d, nombrePlacesVendues: d.nombrePlacesVendues + nombrePlaces }
          : d
      )
    );

    return nouveauxTickets;
  };

  // Valider un ticket
  const validerTicket = (codeTicket: string): boolean => {
    const ticket = tickets.find((t) => t.codeTicket === codeTicket);
    if (!ticket || ticket.statut !== "VALIDE") return false;

    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, statut: "UTILISE" } : t))
    );
    return true;
  };

  // Annuler un ticket
  const annulerTicket = (codeTicket: string): boolean => {
    const ticket = tickets.find((t) => t.codeTicket === codeTicket);
    if (!ticket || ticket.statut !== "VALIDE") return false;

    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, statut: "ANNULE" } : t))
    );

    // Libérer la place
    setDepartsAjoutes((prev) =>
      prev.map((d) =>
        d.id === ticket.departId
          ? { ...d, nombrePlacesVendues: Math.max(0, d.nombrePlacesVendues - 1) }
          : d
      )
    );

    return true;
  };

  // Fonctions utilitaires
  const getLigneById = (id: string): Ligne | undefined => {
    return lignes.find((l) => l.id === id);
  };

  const getDepartById = (id: string): Depart | undefined => {
    return getAllDeparts().find((d) => d.id === id);
  };

  const getTicketByCode = (code: string): Ticket | undefined => {
    return tickets.find((t) => t.codeTicket === code);
  };

  const getOperateurById = (id: string): Operateur | undefined => {
    return operateurs.find((o) => o.id === id);
  };

  const getLignesByOperateur = (operateurId: string): Ligne[] => {
    return lignes.filter((l) => l.operateurId === operateurId);
  };

  const getDepartsByOperateur = (operateurId: string): Depart[] => {
    const lignesIds = lignes.filter((l) => l.operateurId === operateurId).map((l) => l.id);
    return getAllDeparts().filter((d) => lignesIds.includes(d.ligneId));
  };

  const getDepartsByLigne = (ligneId: string): Depart[] => {
    return getAllDeparts().filter((d) => d.ligneId === ligneId);
  };

  const getDepartsByCodeBus = (codeBus: string): Depart[] => {
    try {
      // Utiliser toujours les données fraîches pour avoir des dates à jour
      const tousDeparts = getAllDeparts();
      console.log(`🔍 getDepartsByCodeBus appelé avec "${codeBus}", total départs:`, tousDeparts.length);

      const result = tousDeparts.filter((d) => {
        if (!d.codeBus || typeof d.codeBus !== "string") {
          return false;
        }
        const match = d.codeBus.toLowerCase().includes(codeBus.toLowerCase());
        return match;
      });

      console.log(`✅ Résultats trouvés pour "${codeBus}":`, result.length);
      return result;
    } catch (error) {
      console.error("❌ Erreur dans getDepartsByCodeBus:", error);
      return [];
    }
  };

  const getTicketsByClient = (clientNumero: string): Ticket[] => {
    return tickets.filter((t) => t.clientNumero === clientNumero);
  };

  const getTicketsByOperateur = (operateurId: string): Ticket[] => {
    return tickets.filter((t) => t.operateurId === operateurId);
  };

  const getLignes = (): Ligne[] => {
    return [...lignes];
  };

  const getDeparts = (): Depart[] => {
    return getAllDeparts();
  };

  // Mettre à jour le statut d'un départ
  const mettreAJourStatutDepart = (departId: string, statut: "PLANIFIE" | "EN_COURS" | "TERMINE" | "ANNULE"): void => {
    setDepartsAjoutes((prev) =>
      prev.map((d) => (d.id === departId ? { ...d, statut } : d))
    );
  };

  const value: BilleterieContextType = {
    operateurs,
    agents,
    lignes,
    departs: getAllDeparts(),
    tickets,
    creerLigne,
    creerDepart,
    creerTicket,
    validerTicket,
    annulerTicket,
    getLigneById,
    getDepartById,
    getTicketByCode,
    getOperateurById,
    getLignesByOperateur,
    getDepartsByOperateur,
    getDepartsByLigne,
    getDepartsByCodeBus,
    getTicketsByClient,
    getTicketsByOperateur,
    mettreAJourStatutDepart,
    getLignes,
    getDeparts,
  };

  return <BilleterieContext.Provider value={value}>{children}</BilleterieContext.Provider>;
}

export function useBilleterie() {
  const context = useContext(BilleterieContext);
  if (context === undefined) {
    throw new Error("useBilleterie must be used within a BilleterieProvider");
  }
  return context;
}

