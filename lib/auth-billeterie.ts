import { UserBilleterie, RoleBilleterie } from "@/data/types";

// Utilisateurs simulés pour la billeterie
export const MOCK_USERS_BILLETERIE: UserBilleterie[] = [
  // CLIENT
  {
    id: "CLI-001",
    nom: "Citoyen Démo",
    email: "client@demo.rdc",
    role: "CLIENT",
  },
  // AGENTS
  {
    id: "AGT-001",
    nom: "Jean KABONGO",
    email: "agent.transco@demo.rdc",
    role: "AGENT",
    operateurId: "TRANSCO",
  },
  {
    id: "AGT-003",
    nom: "Pierre KASENGA",
    email: "agent.sncc@demo.rdc",
    role: "AGENT",
    operateurId: "SNCC",
  },
  {
    id: "AGT-005",
    nom: "Paul TSHISEKEDI",
    email: "agent.rva@demo.rdc",
    role: "AGENT",
    operateurId: "RVA",
  },
  // ADMIN_OPERATEUR
  {
    id: "ADM-001",
    nom: "Marie MULUMBA",
    email: "admin.transco@demo.rdc",
    role: "ADMIN_OPERATEUR",
    operateurId: "TRANSCO",
  },
  {
    id: "ADM-002",
    nom: "Sophie TSHILOMBO",
    email: "admin.sncc@demo.rdc",
    role: "ADMIN_OPERATEUR",
    operateurId: "SNCC",
  },
  {
    id: "ADM-003",
    nom: "Lucie KABENGELE",
    email: "admin.rva@demo.rdc",
    role: "ADMIN_OPERATEUR",
    operateurId: "RVA",
  },
  // MINISTERE
  {
    id: "MIN-001",
    nom: "Ministère des Transports",
    email: "ministere@transport.rdc",
    role: "MINISTERE",
  },
];

export function getUserBilleterieById(id: string): UserBilleterie | undefined {
  return MOCK_USERS_BILLETERIE.find((u) => u.id === id);
}

export function getUsersByRole(role: RoleBilleterie): UserBilleterie[] {
  return MOCK_USERS_BILLETERIE.filter((u) => u.role === role);
}

export function getDefaultUserForRole(role: RoleBilleterie, operateurId?: string): UserBilleterie | undefined {
  if (role === "CLIENT") {
    return MOCK_USERS_BILLETERIE.find((u) => u.role === "CLIENT");
  }
  if (role === "MINISTERE") {
    return MOCK_USERS_BILLETERIE.find((u) => u.role === "MINISTERE");
  }
  if ((role === "AGENT" || role === "ADMIN_OPERATEUR") && operateurId) {
    return MOCK_USERS_BILLETERIE.find((u) => u.role === role && u.operateurId === operateurId);
  }
  return MOCK_USERS_BILLETERIE.find((u) => u.role === role);
}



