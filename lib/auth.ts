import { User, Role } from "./types";

// Utilisateurs simulés (en production, ce serait dans une base de données)
export const MOCK_USERS: User[] = [
  {
    id: "U-001",
    nom: "KABONGO",
    prenom: "Jean",
    email: "reception@transport.rdc",
    role: "RECEPTIONNISTE",
    service: "Réception",
    matricule: "MTR-REC-001",
  },
  {
    id: "U-002",
    nom: "MULUMBA",
    prenom: "Marie",
    email: "agent@transport.rdc",
    role: "AGENT",
    service: "Cabinet",
    matricule: "MTR-AGT-002",
  },
  {
    id: "U-003",
    nom: "KASENGA",
    prenom: "Pierre",
    email: "directeur@transport.rdc",
    role: "DIRECTEUR",
    service: "Cabinet",
    matricule: "MTR-DIR-003",
  },
  {
    id: "U-004",
    nom: "TSHISEKEDI",
    prenom: "Paul",
    email: "admin@transport.rdc",
    role: "ADMIN",
    service: "Administration",
    matricule: "MTR-ADM-001",
  },
];

export function authenticate(email: string, password: string): User | null {
  // Pour le prototype, n'importe quel mot de passe fonctionne
  // En production, on vérifierait le hash du mot de passe
  const user = MOCK_USERS.find((u) => u.email === email);
  if (user) {
    return user;
  }
  return null;
}

export function getUserById(id: string): User | null {
  return MOCK_USERS.find((u) => u.id === id) || null;
}

export function hasPermission(user: User, requiredRole: Role | Role[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}

export function getUsers(): User[] {
  return [...MOCK_USERS];
}

