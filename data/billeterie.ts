import {
  Operateur,
  Ligne,
  Depart,
  Ticket,
  Agent,
  StatutTicket,
  StatutDepart,
  CanalAchat,
  ModePaiement,
} from "./types";

// ===== OPÉRATEURS =====
export const operateurs: Operateur[] = [
  {
    id: "TRANSCO",
    nom: "TRANSCO",
    type: "BUS",
    description: "Transport en Commun - Bus urbains et interurbains",
  },
  {
    id: "SNCC",
    nom: "SNCC",
    type: "TRAIN",
    description: "Société Nationale des Chemins de Fer du Congo",
  },
  {
    id: "ONATRA",
    nom: "ONATRA",
    type: "FLUVIAL",
    description: "Office National des Transports - Transport fluvial",
  },
  {
    id: "RVA",
    nom: "RVA",
    type: "AERIEN",
    description: "Régie des Voies Aériennes - Transport aérien public",
  },
  {
    id: "TRANSAUTO",
    nom: "TransAuto Express",
    type: "BUS",
    description: "Transport express interurbain",
  },
];

// ===== AGENTS =====
export const agents: Agent[] = [
  { id: "AGT-001", nom: "Jean KABONGO", operateurId: "TRANSCO", site: "Agence Victoire" },
  { id: "AGT-002", nom: "Marie MULUMBA", operateurId: "TRANSCO", site: "Gare Centrale" },
  { id: "AGT-003", nom: "Pierre KASENGA", operateurId: "SNCC", site: "Gare Centrale" },
  { id: "AGT-004", nom: "Sophie TSHILOMBO", operateurId: "ONATRA", site: "Port de Kinshasa" },
  { id: "AGT-005", nom: "Paul TSHISEKEDI", operateurId: "RVA", site: "Aéroport N'Djili" },
  { id: "AGT-006", nom: "Lucie KABENGELE", operateurId: "TRANSAUTO", site: "Terminal Matete" },
];

// ===== LIGNES =====
export const lignes: Ligne[] = [
  // TRANSCO
  {
    id: "LIG-001",
    operateurId: "TRANSCO",
    code: "TSC-01",
    nom: "Gare Centrale → Campus UNIKIN",
    type: "URBAIN",
    mode: "BUS",
    departPrincipal: "Gare Centrale",
    arriveePrincipale: "Campus UNIKIN",
    dureeMoyenneMinutes: 45,
    prix: 500,
  },
  {
    id: "LIG-002",
    operateurId: "TRANSCO",
    code: "TSC-02",
    nom: "Gombe → Ndjili",
    type: "URBAIN",
    mode: "BUS",
    departPrincipal: "Gombe",
    arriveePrincipale: "Ndjili",
    dureeMoyenneMinutes: 60,
    prix: 800,
  },
  {
    id: "LIG-003",
    operateurId: "TRANSCO",
    code: "TSC-03",
    nom: "Kinshasa → Matadi",
    type: "INTERURBAIN",
    mode: "BUS",
    departPrincipal: "Kinshasa",
    arriveePrincipale: "Matadi",
    dureeMoyenneMinutes: 240,
    prix: 15000,
  },
  // SNCC
  {
    id: "LIG-004",
    operateurId: "SNCC",
    code: "SNC-01",
    nom: "Kinshasa → Matadi",
    type: "INTERURBAIN",
    mode: "TRAIN",
    departPrincipal: "Gare Centrale Kinshasa",
    arriveePrincipale: "Gare Matadi",
    dureeMoyenneMinutes: 480,
    prix: 12000,
  },
  {
    id: "LIG-005",
    operateurId: "SNCC",
    code: "SNC-02",
    nom: "Kinshasa → Lubumbashi",
    type: "INTERURBAIN",
    mode: "TRAIN",
    departPrincipal: "Gare Centrale Kinshasa",
    arriveePrincipale: "Gare Lubumbashi",
    dureeMoyenneMinutes: 8640, // 6 jours
    prix: 45000,
  },
  // ONATRA
  {
    id: "LIG-006",
    operateurId: "ONATRA",
    code: "ONT-01",
    nom: "Kinshasa → Mbandaka",
    type: "INTERURBAIN",
    mode: "BATEAU",
    departPrincipal: "Port de Kinshasa",
    arriveePrincipale: "Port de Mbandaka",
    dureeMoyenneMinutes: 7200, // 5 jours
    prix: 25000,
  },
  {
    id: "LIG-007",
    operateurId: "ONATRA",
    code: "ONT-02",
    nom: "Kinshasa → Kisangani",
    type: "INTERURBAIN",
    mode: "BATEAU",
    departPrincipal: "Port de Kinshasa",
    arriveePrincipale: "Port de Kisangani",
    dureeMoyenneMinutes: 14400, // 10 jours
    prix: 35000,
  },
  // RVA
  {
    id: "LIG-008",
    operateurId: "RVA",
    code: "RVA-01",
    nom: "Kinshasa → Lubumbashi",
    type: "INTERURBAIN",
    mode: "AVION",
    departPrincipal: "Aéroport N'Djili",
    arriveePrincipale: "Aéroport Lubumbashi",
    dureeMoyenneMinutes: 120,
    prix: 150000,
  },
  {
    id: "LIG-009",
    operateurId: "RVA",
    code: "RVA-02",
    nom: "Kinshasa → Goma",
    type: "INTERURBAIN",
    mode: "AVION",
    departPrincipal: "Aéroport N'Djili",
    arriveePrincipale: "Aéroport Goma",
    dureeMoyenneMinutes: 90,
    prix: 180000,
  },
  // TRANSAUTO
  {
    id: "LIG-010",
    operateurId: "TRANSAUTO",
    code: "TAE-01",
    nom: "Kinshasa → Kikwit",
    type: "INTERURBAIN",
    mode: "BUS",
    departPrincipal: "Terminal Matete",
    arriveePrincipale: "Terminal Kikwit",
    dureeMoyenneMinutes: 360,
    prix: 20000,
  },
];

// ===== DÉPARTS =====
// Fonction helper pour générer des dates (calculées dynamiquement)
function getAujourdhui(): Date {
  return new Date();
}

function getDemain(): Date {
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  return demain;
}

function getApresDemain(): Date {
  const apresDemain = new Date();
  apresDemain.setDate(apresDemain.getDate() + 2);
  return apresDemain;
}

function creerDate(jour: Date, heures: number, minutes: number = 0): string {
  const date = new Date(jour);
  date.setHours(heures, minutes, 0, 0);
  return date.toISOString();
}

function creerDateArrivee(depart: string, dureeMinutes: number): string {
  const date = new Date(depart);
  date.setMinutes(date.getMinutes() + dureeMinutes);
  return date.toISOString();
}

// Fonction pour générer les départs avec des dates toujours futures
export function genererDeparts(): Depart[] {
  const maintenant = new Date();
  const aujourdhui = new Date(maintenant);
  const demain = new Date(maintenant);
  demain.setDate(demain.getDate() + 1);
  const apresDemain = new Date(maintenant);
  apresDemain.setDate(apresDemain.getDate() + 2);

  return [
  // TRANSCO TSC-01 (Gare Centrale → UNIKIN)
  {
    id: "DEP-001",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-001",
    dateHeureDepart: creerDate(aujourdhui, 6, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(aujourdhui, 6, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 32,
    nombrePlacesReservees: 0,
    prix: 500,
    statut: "TERMINE",
    disponiblePourAchatImmediat: false,
  },
  {
    id: "DEP-002",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-002",
    dateHeureDepart: creerDate(aujourdhui, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(aujourdhui, 8, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 45,
    nombrePlacesReservees: 0,
    prix: 500,
    statut: "EN_COURS",
    disponiblePourAchatImmediat: false,
  },
  {
    id: "DEP-003",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-003",
    dateHeureDepart: creerDate(demain, 10, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 10, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 28,
    nombrePlacesReservees: 5,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-004",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(demain, 6, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 6, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 0,
    nombrePlacesReservees: 12,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-004B",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-005",
    dateHeureDepart: creerDate(demain, 8, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 8, 30), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 0,
    nombrePlacesReservees: 0,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: false, // Réservation uniquement
  },
  // TRANSCO TSC-02 (Gombe → Ndjili)
  {
    id: "DEP-005",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-101",
    dateHeureDepart: creerDate(aujourdhui, 7, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(aujourdhui, 7, 30), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 35,
    nombrePlacesReservees: 0,
    prix: 800,
    statut: "EN_COURS",
    disponiblePourAchatImmediat: false,
  },
  {
    id: "DEP-006",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(demain, 7, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 7, 30), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 12,
    nombrePlacesReservees: 8,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-006B",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-103",
    dateHeureDepart: creerDate(demain, 10, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 10, 0), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 0,
    nombrePlacesReservees: 0,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: false,
  },
  // TRANSCO TSC-03 (Kinshasa → Matadi)
  {
    id: "DEP-007",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(demain, 5, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 5, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 48,
    nombrePlacesReservees: 5,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-007B",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-202",
    dateHeureDepart: creerDate(demain, 14, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 14, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 0,
    nombrePlacesReservees: 0,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: false,
  },
  // SNCC SNC-01 (Kinshasa → Matadi)
  {
    id: "DEP-008",
    ligneId: "LIG-004",
    codeBus: "TRAIN-SNC-001",
    dateHeureDepart: creerDate(demain, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 8, 0), 480),
    nombrePlacesTotal: 200,
    nombrePlacesVendues: 156,
    prix: 12000,
    statut: "PLANIFIE",
  },
  {
    id: "DEP-009",
    ligneId: "LIG-004",
    codeBus: "TRAIN-SNC-002",
    dateHeureDepart: creerDate(apresDemain, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 8, 0), 480),
    nombrePlacesTotal: 200,
    nombrePlacesVendues: 42,
    prix: 12000,
    statut: "PLANIFIE",
  },
  // SNCC SNC-02 (Kinshasa → Lubumbashi)
  {
    id: "DEP-010",
    ligneId: "LIG-005",
    codeBus: "TRAIN-SNC-003",
    dateHeureDepart: creerDate(apresDemain, 10, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 10, 0), 8640),
    nombrePlacesTotal: 300,
    nombrePlacesVendues: 89,
    prix: 45000,
    statut: "PLANIFIE",
  },
  // ONATRA ONT-01 (Kinshasa → Mbandaka)
  {
    id: "DEP-011",
    ligneId: "LIG-006",
    codeBus: "BATEAU-ONT-001",
    dateHeureDepart: creerDate(demain, 14, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 14, 0), 7200),
    nombrePlacesTotal: 150,
    nombrePlacesVendues: 112,
    prix: 25000,
    statut: "PLANIFIE",
  },
  // RVA RVA-01 (Kinshasa → Lubumbashi)
  {
    id: "DEP-012",
    ligneId: "LIG-008",
    codeBus: "AVION-RVA-001",
    dateHeureDepart: creerDate(demain, 7, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 7, 0), 120),
    nombrePlacesTotal: 120,
    nombrePlacesVendues: 98,
    prix: 150000,
    statut: "PLANIFIE",
  },
  {
    id: "DEP-013",
    ligneId: "LIG-008",
    codeBus: "AVION-RVA-002",
    dateHeureDepart: creerDate(apresDemain, 7, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 7, 0), 120),
    nombrePlacesTotal: 120,
    nombrePlacesVendues: 67,
    prix: 150000,
    statut: "PLANIFIE",
  },
  // RVA RVA-02 (Kinshasa → Goma)
  {
    id: "DEP-014",
    ligneId: "LIG-009",
    codeBus: "AVION-RVA-003",
    dateHeureDepart: creerDate(demain, 11, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 11, 30), 90),
    nombrePlacesTotal: 120,
    nombrePlacesVendues: 84,
    prix: 180000,
    statut: "PLANIFIE",
  },
  // TRANSAUTO TAE-01 (Kinshasa → Kikwit)
  {
    id: "DEP-015",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(demain, 6, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 6, 30), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 38,
    prix: 20000,
    statut: "PLANIFIE",
  },
  // DÉPARTS SUPPLÉMENTAIRES POUR DÉMONSTRATION
  // BUS-TSC-003 - Départs supplémentaires
  {
    id: "DEP-003B",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-003",
    dateHeureDepart: creerDate(demain, 14, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 14, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 15,
    nombrePlacesReservees: 3,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-003C",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-003",
    dateHeureDepart: creerDate(apresDemain, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 8, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 10,
    nombrePlacesReservees: 2,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TSC-004 - Départs supplémentaires
  {
    id: "DEP-004C",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(demain, 12, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 12, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 5,
    nombrePlacesReservees: 5,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-004D",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(apresDemain, 6, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 6, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 8,
    nombrePlacesReservees: 4,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TSC-102 - Départs supplémentaires
  {
    id: "DEP-006C",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(demain, 13, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 13, 0), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 8,
    nombrePlacesReservees: 5,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-006D",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(apresDemain, 7, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 7, 30), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 5,
    nombrePlacesReservees: 3,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TSC-201 - Départs supplémentaires
  {
    id: "DEP-007C",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(demain, 11, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 11, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 25,
    nombrePlacesReservees: 3,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-007D",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(apresDemain, 5, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 5, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 20,
    nombrePlacesReservees: 2,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TAE-001 - Départs supplémentaires
  {
    id: "DEP-015B",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(demain, 12, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 12, 0), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 20,
    nombrePlacesReservees: 0,
    prix: 20000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-015C",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(apresDemain, 6, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 6, 30), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 15,
    nombrePlacesReservees: 0,
    prix: 20000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // ITINÉRAIRES SUPPLÉMENTAIRES POUR TOUS LES BUS DE DÉMONSTRATION
  // BUS-TSC-003 - Itinéraires supplémentaires
  {
    id: "DEP-003D",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-003",
    dateHeureDepart: creerDate(demain, 16, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 16, 30), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 20,
    nombrePlacesReservees: 2,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-003E",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-003",
    dateHeureDepart: creerDate(apresDemain, 10, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 10, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 5,
    nombrePlacesReservees: 1,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-003F",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-003",
    dateHeureDepart: creerDate(apresDemain, 14, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 14, 30), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 12,
    nombrePlacesReservees: 3,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-003G",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-003",
    dateHeureDepart: creerDate(apresDemain, 18, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 18, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 8,
    nombrePlacesReservees: 2,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TSC-004 - Itinéraires supplémentaires
  {
    id: "DEP-004E",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(demain, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 8, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 3,
    nombrePlacesReservees: 4,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-004F",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(demain, 15, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 15, 30), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 10,
    nombrePlacesReservees: 6,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-004G",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(apresDemain, 8, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 8, 30), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 6,
    nombrePlacesReservees: 3,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-004H",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(apresDemain, 13, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 13, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 15,
    nombrePlacesReservees: 5,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-004I",
    ligneId: "LIG-001",
    codeBus: "BUS-TSC-004",
    dateHeureDepart: creerDate(apresDemain, 17, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 17, 0), 45),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 4,
    nombrePlacesReservees: 2,
    prix: 500,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TSC-102 - Itinéraires supplémentaires
  {
    id: "DEP-006E",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(demain, 9, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 9, 0), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 6,
    nombrePlacesReservees: 4,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-006F",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(demain, 15, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 15, 30), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 18,
    nombrePlacesReservees: 6,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-006G",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(apresDemain, 9, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 9, 0), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 3,
    nombrePlacesReservees: 2,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-006H",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(apresDemain, 14, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 14, 0), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 10,
    nombrePlacesReservees: 4,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-006I",
    ligneId: "LIG-002",
    codeBus: "BUS-TSC-102",
    dateHeureDepart: creerDate(apresDemain, 18, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 18, 0), 60),
    nombrePlacesTotal: 40,
    nombrePlacesVendues: 7,
    nombrePlacesReservees: 3,
    prix: 800,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TSC-201 - Itinéraires supplémentaires
  {
    id: "DEP-007E",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(demain, 7, 30),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 7, 30), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 30,
    nombrePlacesReservees: 4,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-007F",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(demain, 15, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 15, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 15,
    nombrePlacesReservees: 2,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-007G",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(apresDemain, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 8, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 22,
    nombrePlacesReservees: 3,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-007H",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(apresDemain, 13, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 13, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 18,
    nombrePlacesReservees: 1,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-007I",
    ligneId: "LIG-003",
    codeBus: "BUS-TSC-201",
    dateHeureDepart: creerDate(apresDemain, 18, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 18, 0), 240),
    nombrePlacesTotal: 60,
    nombrePlacesVendues: 12,
    nombrePlacesReservees: 2,
    prix: 15000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  // BUS-TAE-001 - Itinéraires supplémentaires
  {
    id: "DEP-015D",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(demain, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 8, 0), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 25,
    nombrePlacesReservees: 0,
    prix: 20000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-015E",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(demain, 16, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(demain, 16, 0), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 18,
    nombrePlacesReservees: 0,
    prix: 20000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-015F",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(apresDemain, 8, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 8, 0), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 10,
    nombrePlacesReservees: 0,
    prix: 20000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-015G",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(apresDemain, 14, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 14, 0), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 22,
    nombrePlacesReservees: 0,
    prix: 20000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  {
    id: "DEP-015H",
    ligneId: "LIG-010",
    codeBus: "BUS-TAE-001",
    dateHeureDepart: creerDate(apresDemain, 20, 0),
    dateHeureArrivee: creerDateArrivee(creerDate(apresDemain, 20, 0), 360),
    nombrePlacesTotal: 50,
    nombrePlacesVendues: 8,
    nombrePlacesReservees: 0,
    prix: 20000,
    statut: "PLANIFIE",
    disponiblePourAchatImmediat: true,
  },
  ];
}

// Export des départs générés dynamiquement
export function getDeparts(): Depart[] {
  return genererDeparts();
}

// Pour la compatibilité, on exporte aussi un tableau (mais il sera recalculé dans le contexte)
export let departs: Depart[] = genererDeparts();

// ===== TICKETS =====
// Fonction helper pour générer un code ticket
function genererCodeTicket(operateurId: string, index: number): string {
  const prefix = operateurId.substring(0, 3).toUpperCase();
  const numero = String(index).padStart(8, "0");
  return `${prefix}-${numero}`;
}

export let tickets: Ticket[] = [
  // Tickets TRANSCO
  {
    id: "TKT-001",
    codeTicket: genererCodeTicket("TRANSCO", 1),
    clientNom: "Jean KABONGO",
    clientNumero: "+243900000001",
    operateurId: "TRANSCO",
    ligneId: "LIG-001",
    departId: "DEP-001",
    dateAchat: creerDate(getAujourdhui(), 5, 30),
    canalAchat: "WEB",
    modePaiement: "MOBILE_MONEY",
    statut: "UTILISE",
    prixPaye: 500,
  },
  {
    id: "TKT-002",
    codeTicket: genererCodeTicket("TRANSCO", 2),
    clientNom: "Marie MULUMBA",
    clientNumero: "+243900000002",
    operateurId: "TRANSCO",
    ligneId: "LIG-001",
    departId: "DEP-001",
    dateAchat: creerDate(getAujourdhui(), 5, 45),
    canalAchat: "AGENT_POS",
    modePaiement: "CASH",
    statut: "UTILISE",
    prixPaye: 500,
    agentId: "AGT-001",
  },
  {
    id: "TKT-003",
    codeTicket: genererCodeTicket("TRANSCO", 3),
    clientNom: "Pierre KASENGA",
    clientNumero: "+243900000003",
    operateurId: "TRANSCO",
    ligneId: "LIG-002",
    departId: "DEP-005",
    dateAchat: creerDate(getAujourdhui(), 6, 0),
    canalAchat: "WEB",
    modePaiement: "MOBILE_MONEY",
    statut: "VALIDE",
    prixPaye: 800,
  },
  {
    id: "TKT-004",
    codeTicket: genererCodeTicket("TRANSCO", 4),
    clientNom: "Sophie TSHILOMBO",
    clientNumero: "+243900000004",
    operateurId: "TRANSCO",
    ligneId: "LIG-001",
    departId: "DEP-003",
    dateAchat: creerDate(getAujourdhui(), 8, 30),
    canalAchat: "AGENT_POS",
    modePaiement: "CASH",
    statut: "VALIDE",
    prixPaye: 500,
    agentId: "AGT-002",
  },
  {
    id: "TKT-005",
    codeTicket: genererCodeTicket("TRANSCO", 5),
    clientNom: "Paul TSHISEKEDI",
    clientNumero: "+243900000005",
    operateurId: "TRANSCO",
    ligneId: "LIG-003",
    departId: "DEP-007",
    dateAchat: creerDate(getAujourdhui(), 10, 0),
    canalAchat: "WEB",
    modePaiement: "CARTE",
    statut: "VALIDE",
    prixPaye: 15000,
  },
  // Tickets SNCC
  {
    id: "TKT-006",
    codeTicket: genererCodeTicket("SNCC", 1),
    clientNom: "Lucie KABENGELE",
    clientNumero: "+243900000006",
    operateurId: "SNCC",
    ligneId: "LIG-004",
    departId: "DEP-008",
    dateAchat: creerDate(getAujourdhui(), 7, 0),
    canalAchat: "WEB",
    modePaiement: "MOBILE_MONEY",
    statut: "VALIDE",
    prixPaye: 12000,
  },
  {
    id: "TKT-007",
    codeTicket: genererCodeTicket("SNCC", 2),
    clientNom: "Antoine KAMBA",
    clientNumero: "+243900000007",
    operateurId: "SNCC",
    ligneId: "LIG-004",
    departId: "DEP-008",
    dateAchat: creerDate(getAujourdhui(), 7, 15),
    canalAchat: "AGENT_POS",
    modePaiement: "CASH",
    statut: "VALIDE",
    prixPaye: 12000,
    agentId: "AGT-003",
  },
  {
    id: "TKT-008",
    codeTicket: genererCodeTicket("SNCC", 3),
    clientNom: "François MBALA",
    clientNumero: "+243900000008",
    operateurId: "SNCC",
    ligneId: "LIG-005",
    departId: "DEP-010",
    dateAchat: creerDate(getAujourdhui(), 9, 0),
    canalAchat: "WEB",
    modePaiement: "CARTE",
    statut: "VALIDE",
    prixPaye: 45000,
  },
  // Tickets ONATRA
  {
    id: "TKT-009",
    codeTicket: genererCodeTicket("ONATRA", 1),
    clientNom: "Brigitte KALONDA",
    clientNumero: "+243900000009",
    operateurId: "ONATRA",
    ligneId: "LIG-006",
    departId: "DEP-011",
    dateAchat: creerDate(getAujourdhui(), 12, 0),
    canalAchat: "AGENT_POS",
    modePaiement: "CASH",
    statut: "VALIDE",
    prixPaye: 25000,
    agentId: "AGT-004",
  },
  // Tickets RVA
  {
    id: "TKT-010",
    codeTicket: genererCodeTicket("RVA", 1),
    clientNom: "Daniel KANZA",
    clientNumero: "+243900000010",
    operateurId: "RVA",
    ligneId: "LIG-008",
    departId: "DEP-012",
    dateAchat: creerDate(getAujourdhui(), 6, 0),
    canalAchat: "WEB",
    modePaiement: "CARTE",
    statut: "VALIDE",
    prixPaye: 150000,
  },
  {
    id: "TKT-011",
    codeTicket: genererCodeTicket("RVA", 2),
    clientNom: "Esther LUMANGA",
    clientNumero: "+243900000011",
    operateurId: "RVA",
    ligneId: "LIG-009",
    departId: "DEP-014",
    dateAchat: creerDate(getAujourdhui(), 10, 0),
    canalAchat: "WEB",
    modePaiement: "MOBILE_MONEY",
    statut: "VALIDE",
    prixPaye: 180000,
  },
  // Ticket annulé
  {
    id: "TKT-012",
    codeTicket: genererCodeTicket("TRANSCO", 6),
    clientNom: "Gérard MUKENDI",
    clientNumero: "+243900000012",
    operateurId: "TRANSCO",
    ligneId: "LIG-001",
    departId: "DEP-001",
    dateAchat: creerDate(getAujourdhui(), 5, 0),
    canalAchat: "WEB",
    modePaiement: "MOBILE_MONEY",
    statut: "ANNULE",
    prixPaye: 500,
  },
];

// ===== FONCTIONS UTILITAIRES =====

export function getOperateurs(): Operateur[] {
  return [...operateurs];
}

export function getOperateurById(id: string): Operateur | undefined {
  return operateurs.find((o) => o.id === id);
}

export function getLignes(): Ligne[] {
  return [...lignes];
}

export function getLignesByOperateur(operateurId: string): Ligne[] {
  return lignes.filter((l) => l.operateurId === operateurId);
}

export function getLigneById(id: string): Ligne | undefined {
  return lignes.find((l) => l.id === id);
}

// Fonction pour créer une nouvelle ligne
export function creerLigne(
  operateurId: string,
  code: string,
  nom: string,
  type: "URBAIN" | "INTERURBAIN" | "INTERNATIONAL",
  mode: "BUS" | "TRAIN" | "BATEAU" | "AVION",
  departPrincipal: string,
  arriveePrincipale: string,
  dureeMoyenneMinutes: number,
  prix: number
): Ligne {
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
  lignes.push(nouvelleLigne);
  return nouvelleLigne;
}

// Fonction pour créer un nouveau départ
export function creerDepart(
  ligneId: string,
  codeBus: string,
  dateHeureDepart: string,
  nombrePlacesTotal: number,
  nombrePlacesReservees: number = 0,
  disponiblePourAchatImmediat: boolean = true
): Depart {
  const ligne = getLigneById(ligneId);
  if (!ligne) {
    throw new Error("Ligne introuvable");
  }

  const dateDepart = new Date(dateHeureDepart);
  const dateArrivee = new Date(dateDepart);
  dateArrivee.setMinutes(dateArrivee.getMinutes() + ligne.dureeMoyenneMinutes);

  const nouveauDepart: Depart = {
    id: `DEP-${String(departs.length + 1).padStart(3, "0")}`,
    ligneId,
    codeBus,
    dateHeureDepart: dateDepart.toISOString(),
    dateHeureArrivee: dateArrivee.toISOString(),
    nombrePlacesTotal,
    nombrePlacesVendues: 0,
    nombrePlacesReservees,
    prix: ligne.prix, // Utiliser le prix de la ligne
    statut: "PLANIFIE",
    disponiblePourAchatImmediat,
  };
  departs.push(nouveauDepart);
  return nouveauDepart;
}

export function getDepartsByLigne(ligneId: string): Depart[] {
  return genererDeparts().filter((d) => d.ligneId === ligneId);
}

export function getDepartsByOperateur(operateurId: string): Depart[] {
  const lignesIds = lignes.filter((l) => l.operateurId === operateurId).map((l) => l.id);
  return genererDeparts().filter((d) => lignesIds.includes(d.ligneId));
}

export function getDepartById(id: string): Depart | undefined {
  return genererDeparts().find((d) => d.id === id);
}

export function getDepartsByCodeBus(codeBus: string): Depart[] {
  return genererDeparts().filter((d) => {
    // Vérifier que codeBus existe et est une chaîne avant d'appeler toLowerCase
    if (!d.codeBus || typeof d.codeBus !== 'string') {
      return false;
    }
    return d.codeBus.toLowerCase().includes(codeBus.toLowerCase());
  });
}

export function getTickets(): Ticket[] {
  return [...tickets];
}

export function getTicketsByDepart(departId: string): Ticket[] {
  return tickets.filter((t) => t.departId === departId);
}

export function getTicketsByOperateur(operateurId: string): Ticket[] {
  return tickets.filter((t) => t.operateurId === operateurId);
}

export function getTicketsByClient(clientNumero: string): Ticket[] {
  return tickets.filter((t) => t.clientNumero === clientNumero);
}

export function getTicketByCode(codeTicket: string): Ticket | undefined {
  return tickets.find((t) => t.codeTicket === codeTicket);
}

export function getAgents(): Agent[] {
  return [...agents];
}

export function getAgentsByOperateur(operateurId: string): Agent[] {
  return agents.filter((a) => a.operateurId === operateurId);
}

// Fonction pour créer un nouveau ticket
export function creerTicket(
  clientNom: string,
  clientNumero: string,
  departId: string,
  nombrePlaces: number,
  canalAchat: CanalAchat,
  modePaiement: ModePaiement,
  agentId?: string
): Ticket[] {
  const depart = getDepartById(departId);
  if (!depart) throw new Error("Départ introuvable");

  const ligne = getLigneById(depart.ligneId);
  if (!ligne) throw new Error("Ligne introuvable");

  const operateur = getOperateurById(ligne.operateurId);
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
    tickets.push(nouveauTicket);
    nouveauxTickets.push(nouveauTicket);
  }

  // Mettre à jour le nombre de places vendues
  depart.nombrePlacesVendues += nombrePlaces;

  return nouveauxTickets;
}

// Fonction pour valider un ticket (changer statut de VALIDE à UTILISE)
export function validerTicket(codeTicket: string): boolean {
  const ticket = getTicketByCode(codeTicket);
  if (!ticket) return false;
  if (ticket.statut !== "VALIDE") return false;

  ticket.statut = "UTILISE";
  return true;
}

// Fonction pour annuler un ticket
export function annulerTicket(codeTicket: string): boolean {
  const ticket = getTicketByCode(codeTicket);
  if (!ticket) return false;
  if (ticket.statut !== "VALIDE") return false;

  ticket.statut = "ANNULE";
  const depart = getDepartById(ticket.departId);
  if (depart) {
    depart.nombrePlacesVendues = Math.max(0, depart.nombrePlacesVendues - 1);
  }
  return true;
}

