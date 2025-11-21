import { Courrier, AINotification } from "./types";

// Stockage en mémoire (simulation de base de données)
let courriers: Courrier[] = [
  {
    id: "C-2025-0001",
    ref: "CAB/MTR/001/2025",
    type: "ENTRANT",
    objet: "Demande d'agrément d'une société de sécurité",
    expéditeur: "Société UZALENDO SARL",
    destinataire: "Cabinet du Ministre du Transport",
    date: "2025-01-05",
    statut: "EN_CIRCUIT",
    service: "Cabinet",
    pièceJointe: "scan/UZALENDO-AGR.pdf",
    dateRéception: "2025-01-05",
    dateNumérisation: "2025-01-05",
    dateEncodage: "2025-01-05",
    dateTraitement: "2025-01-07",
    priorité: "URGENTE",
    numériséPar: "user-001",
    encodéPar: "user-002",
    traitéPar: "user-003",
  },
  {
    id: "C-2025-0002",
    ref: "SG/MTR/015/2025",
    type: "ENTRANT",
    objet: "Rapport trimestriel inspection du travail",
    expéditeur: "Inspection du travail – Kinshasa",
    destinataire: "Secrétariat Général",
    date: "2025-01-06",
    statut: "VALIDE",
    service: "Secrétariat Général",
    pièceJointe: "scan/RAPPORT-IT-KIN.pdf",
    dateRéception: "2025-01-06",
    dateNumérisation: "2025-01-06",
    dateEncodage: "2025-01-06",
    dateTraitement: "2025-01-08",
    dateValidation: "2025-01-10",
    priorité: "NORMALE",
    numériséPar: "user-001",
    encodéPar: "user-002",
    traitéPar: "user-004",
    validéPar: "user-005",
  },
  {
    id: "C-2025-0003",
    ref: "MTR/CAB/REP/001/2025",
    type: "SORTANT",
    objet: "Réponse à la demande d'agrément UZALENDO",
    expéditeur: "Cabinet du Ministre du Transport",
    destinataire: "Société UZALENDO SARL",
    date: "2025-01-10",
    statut: "EN_ATTENTE_VALIDATION",
    liéÀ: "C-2025-0001",
    service: "Cabinet",
    dateRéception: "2025-01-10",
    priorité: "NORMALE",
  },
  {
    id: "C-2025-0004",
    ref: "INSP/MTR/042/2025",
    type: "ENTRANT",
    objet: "Plainte concernant les conditions de travail sur le chantier Route Matadi",
    expéditeur: "Syndicat des Travailleurs du BTP",
    destinataire: "Service d'Inspection",
    date: "2025-01-12",
    statut: "RECU",
    service: "Inspection",
    dateRéception: "2025-01-12",
    priorité: "URGENTE",
  },
  {
    id: "C-2025-0005",
    ref: "SG/MTR/028/2025",
    type: "ENTRANT",
    objet: "Demande de budget pour réhabilitation des routes nationales",
    expéditeur: "Direction Générale des Routes",
    destinataire: "Secrétariat Général",
    date: "2025-01-08",
    statut: "NUMERISE",
    service: "Secrétariat Général",
    dateRéception: "2025-01-08",
    dateNumérisation: "2025-01-08",
    priorité: "NORMALE",
    numériséPar: "user-001",
  },
  {
    id: "C-2025-0006",
    ref: "CAB/MTR/REP/002/2025",
    type: "SORTANT",
    objet: "Réponse à la plainte syndicale - Route Matadi",
    expéditeur: "Service d'Inspection",
    destinataire: "Syndicat des Travailleurs du BTP",
    date: "2025-01-15",
    statut: "EN_ATTENTE_VALIDATION",
    liéÀ: "C-2025-0004",
    service: "Inspection",
    dateRéception: "2025-01-15",
    priorité: "URGENTE",
  },
  {
    id: "C-2025-0007",
    ref: "TRANSCO/MTR/011/2025",
    type: "ENTRANT",
    objet: "Rapport mensuel d'activité - Janvier 2025",
    expéditeur: "TRANSCO (Transport en Commun)",
    destinataire: "Direction des Transports",
    date: "2025-01-20",
    statut: "ARCHIVE",
    service: "Direction des Transports",
    dateRéception: "2025-01-20",
    dateNumérisation: "2025-01-20",
    dateEncodage: "2025-01-20",
    dateTraitement: "2025-01-22",
    dateValidation: "2025-01-25",
    priorité: "NORMALE",
    numériséPar: "user-001",
    encodéPar: "user-002",
    traitéPar: "user-006",
    validéPar: "user-005",
  },
  {
    id: "C-2025-0008",
    ref: "RVA/MTR/005/2025",
    type: "ENTRANT",
    objet: "Demande d'autorisation pour nouveau terminal aéroportuaire",
    expéditeur: "Régie des Voies Aériennes (RVA)",
    destinataire: "Cabinet du Ministre",
    date: "2025-01-18",
    statut: "EN_ATTENTE_VALIDATION",
    service: "Cabinet",
    dateRéception: "2025-01-18",
    dateNumérisation: "2025-01-18",
    dateEncodage: "2025-01-18",
    dateTraitement: "2025-01-20",
    priorité: "TRES_URGENTE",
    numériséPar: "user-001",
    encodéPar: "user-002",
    traitéPar: "user-003",
  },
  {
    id: "C-2025-0009",
    ref: "SCTP/MTR/033/2025",
    type: "ENTRANT",
    objet: "Rapport d'audit sécurité portuaire - Port de Matadi",
    expéditeur: "Société Commerciale des Transports et des Ports (SCTP)",
    destinataire: "Secrétariat Général",
    date: "2025-01-14",
    statut: "VALIDE",
    service: "Secrétariat Général",
    dateRéception: "2025-01-14",
    dateNumérisation: "2025-01-14",
    dateEncodage: "2025-01-14",
    dateTraitement: "2025-01-16",
    dateValidation: "2025-01-18",
    priorité: "NORMALE",
    numériséPar: "user-001",
    encodéPar: "user-002",
    traitéPar: "user-004",
    validéPar: "user-005",
  },
  {
    id: "C-2025-0010",
    ref: "MTR/SG/REP/003/2025",
    type: "SORTANT",
    objet: "Réponse favorable à la demande de budget - Routes nationales",
    expéditeur: "Secrétariat Général",
    destinataire: "Direction Générale des Routes",
    date: "2025-01-22",
    statut: "VALIDE",
    liéÀ: "C-2025-0005",
    service: "Secrétariat Général",
    dateRéception: "2025-01-22",
    dateValidation: "2025-01-22",
    priorité: "NORMALE",
    validéPar: "user-005",
  },
];

// Notifications initiales simulées
let notifications: AINotification[] = [
  {
    id: "notif-001",
    message: "Le courrier CAB/MTR/001/2025 est en retard de 3 jours.",
    niveau: "ALERTE",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    courrierId: "C-2025-0001",
    type: "COURRIER",
  },
  {
    id: "notif-002",
    message: "2 courriers urgents en attente de validation au Cabinet.",
    niveau: "ALERTE",
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    type: "COURRIER",
  },
  {
    id: "notif-003",
    message: "Le délai moyen de traitement dépasse 5 jours pour le service Inspection.",
    niveau: "INFO",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: "COURRIER",
  },
];

export function getCourriers(): Courrier[] {
  return [...courriers];
}

export function getCourrierById(id: string): Courrier | undefined {
  return courriers.find((c) => c.id === id);
}

export function addCourrier(courrier: Omit<Courrier, "id" | "ref">): Courrier {
  const year = new Date().getFullYear();
  const count = courriers.filter((c) => c.date.startsWith(year.toString())).length + 1;
  const newId = `C-${year}-${String(count).padStart(4, "0")}`;
  const newRef = `MTR/${newId}`;

  const newCourrier: Courrier = {
    ...courrier,
    id: newId,
    ref: newRef,
  };

  courriers.push(newCourrier);
  return newCourrier;
}

export function updateCourrier(id: string, updates: Partial<Courrier>): Courrier | null {
  const index = courriers.findIndex((c) => c.id === id);
  if (index === -1) return null;

  courriers[index] = { ...courriers[index], ...updates };
  return courriers[index];
}

export function getNotifications(userId?: string): AINotification[] {
  if (userId) {
    return notifications.filter((n) => !n.userId || n.userId === userId);
  }
  return [...notifications];
}

export function addNotification(notification: Omit<AINotification, "id" | "date">): void {
  notifications.unshift({
    ...notification,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  });

  // Garder seulement les 50 dernières notifications
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }
}

