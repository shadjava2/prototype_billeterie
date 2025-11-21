// Types pour la plateforme de billeterie nationale

export type RoleBilleterie = "CLIENT" | "AGENT" | "ADMIN_OPERATEUR" | "MINISTERE";

export type TypeOperateur = "BUS" | "TRAIN" | "FLUVIAL" | "AERIEN" | "MULTIMODAL";

export type TypeLigne = "URBAIN" | "INTERURBAIN" | "INTERNATIONAL";

export type ModeTransport = "BUS" | "TRAIN" | "BATEAU" | "AVION";

export type StatutDepart = "PLANIFIE" | "EN_COURS" | "TERMINE" | "ANNULE";

export type CanalAchat = "WEB" | "AGENT_POS";

export type ModePaiement = "CASH" | "MOBILE_MONEY" | "CARTE";

export type StatutTicket = "VALIDE" | "UTILISE" | "ANNULE";

export interface UserBilleterie {
  id: string;
  nom: string;
  email?: string;
  role: RoleBilleterie;
  operateurId?: string; // Pour AGENT et ADMIN_OPERATEUR uniquement
}

export interface Operateur {
  id: string;
  nom: string;
  type: TypeOperateur;
  description?: string;
}

export interface Ligne {
  id: string;
  operateurId: string;
  code: string;
  nom: string;
  type: TypeLigne;
  mode: ModeTransport;
  departPrincipal: string;
  arriveePrincipale: string;
  dureeMoyenneMinutes: number;
  prix: number; // Prix unitaire en FC pour cette ligne
}

export interface Depart {
  id: string;
  ligneId: string;
  codeBus: string; // Code unique du bus/véhicule (ex: BUS-001, TRAIN-A12, BATEAU-MB-05)
  dateHeureDepart: string; // ISO string
  dateHeureArrivee: string; // ISO string
  nombrePlacesTotal: number;
  nombrePlacesVendues: number;
  nombrePlacesReservees: number; // Places réservées (paiement différé)
  prix: number; // Prix unitaire en FC
  statut: StatutDepart;
  disponiblePourAchatImmediat: boolean; // Si true : paiement immédiat, si false : réservation uniquement
}

export interface Ticket {
  id: string;
  codeTicket: string; // Code pour affichage + QR
  clientNom: string;
  clientNumero: string; // Téléphone
  operateurId: string;
  ligneId: string;
  departId: string;
  dateAchat: string; // ISO string
  canalAchat: CanalAchat;
  modePaiement: ModePaiement;
  statut: StatutTicket;
  prixPaye: number;
  agentId?: string; // Si vendu par un agent
}

export interface Agent {
  id: string;
  nom: string;
  operateurId: string;
  site: string; // Ex: "Agence Victoire", "Gare Centrale"
}

