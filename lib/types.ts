export type Role = "RECEPTIONNISTE" | "AGENT" | "DIRECTEUR" | "VISITEUR" | "ADMIN";

export type CourrierStatut =
  | "RECU"
  | "NUMERISE"
  | "EN_CIRCUIT"
  | "EN_ATTENTE_VALIDATION"
  | "VALIDE"
  | "REPONDU"
  | "ARCHIVE";

export type TypeCourrier = "ENTRANT" | "SORTANT";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  service?: string;
  matricule: string;
}

export interface Courrier {
  id: string;
  ref: string;
  type: TypeCourrier;
  objet: string;
  expéditeur: string;
  destinataire: string;
  date: string;
  statut: CourrierStatut;
  liéÀ?: string;
  service?: string;
  pièceJointe?: string;
  numériséPar?: string;
  encodéPar?: string;
  traitéPar?: string;
  validéPar?: string;
  dateRéception?: string;
  dateNumérisation?: string;
  dateEncodage?: string;
  dateTraitement?: string;
  dateValidation?: string;
  observations?: string;
  priorité?: "NORMALE" | "URGENTE" | "TRES_URGENTE";
  // Système collaboratif
  responsableActuel?: string; // ID de l'utilisateur actuellement responsable
  droitsAccès?: DroitAccès[]; // Liste des utilisateurs ayant des droits
  commentaires?: Commentaire[]; // Chat/commentaires
  transferts?: Transfert[]; // Historique des transferts
  dateLimiteTraitement?: string; // Date limite pour le traitement
  canal?: "POSTAL" | "EMAIL" | "DEPOT_PHYSIQUE" | "FAX" | "AUTRE";
  structureConcernee?: string; // Ex: "TRANSCO", "RVA", "SCTP"
}

export interface Commentaire {
  id: string;
  courrierId: string;
  auteurId: string;
  auteurNom: string;
  auteurRole: Role;
  contenu: string;
  date: string;
  type?: "COMMENTAIRE" | "AVIS" | "QUESTION" | "REPONSE";
  mentionnéIds?: string[]; // IDs des utilisateurs mentionnés
  luPar?: string[]; // IDs des utilisateurs qui ont lu
}

export interface DroitAccès {
  userId: string;
  userName: string;
  permissions: ("LECTURE" | "ECRITURE" | "PARTAGE" | "SUPPRESSION")[];
  dateAjout: string;
  ajoutéPar: string;
}

export interface Transfert {
  id: string;
  courrierId: string;
  deUserId: string;
  deUserName: string;
  versUserId: string;
  versUserName: string;
  raison?: string;
  date: string;
  statutAvant: CourrierStatut;
  statutAprès?: CourrierStatut;
}

export interface AINotification {
  id: string;
  message: string;
  niveau: "INFO" | "ALERTE";
  date: string;
  courrierId?: string;
  type?: "COURRIER" | "COMMENTAIRE" | "TRANSFERT" | "DROIT" | "MENTION";
  userId?: string; // Pour les notifications personnalisées
}

