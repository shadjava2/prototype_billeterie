import { Commentaire, DroitAccès, Transfert, Courrier, User } from "./types";
import { getCourrierById, updateCourrier, addNotification } from "./data";
import { getUserById } from "./auth";

// Stockage en mémoire pour les données collaboratives
let commentaires: Commentaire[] = [];
let droitsAccès: Map<string, DroitAccès[]> = new Map(); // courrierId -> droits
let transferts: Transfert[] = [];

// ========== COMMENTAIRES / CHAT ==========

export function getCommentaires(courrierId: string): Commentaire[] {
  return commentaires
    .filter((c) => c.courrierId === courrierId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function addCommentaire(
  courrierId: string,
  auteurId: string,
  contenu: string,
  type: "COMMENTAIRE" | "AVIS" | "QUESTION" | "REPONSE" = "COMMENTAIRE",
  mentionnéIds: string[] = []
): Commentaire {
  const auteur = getUserById(auteurId);
  if (!auteur) throw new Error("Auteur introuvable");

  const nouveauCommentaire: Commentaire = {
    id: `COM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    courrierId,
    auteurId,
    auteurNom: `${auteur.prenom} ${auteur.nom}`,
    auteurRole: auteur.role,
    contenu,
    date: new Date().toISOString(),
    type,
    mentionnéIds,
    luPar: [auteurId], // L'auteur a déjà lu son propre message
  };

  commentaires.push(nouveauCommentaire);

  // Notifier les utilisateurs mentionnés
  mentionnéIds.forEach((userId) => {
    const user = getUserById(userId);
    if (user) {
      addNotification({
        message: `${auteur.prenom} ${auteur.nom} vous a mentionné dans un commentaire sur ${getCourrierById(courrierId)?.ref}`,
        niveau: "ALERTE",
        courrierId,
        type: "MENTION",
        userId,
      });
    }
  });

  // Notifier les autres participants du courrier
  const courrier = getCourrierById(courrierId);
  if (courrier) {
    const participants = new Set<string>();
    if (courrier.responsableActuel) participants.add(courrier.responsableActuel);
    if (courrier.traitéPar) participants.add(courrier.traitéPar);
    if (courrier.encodéPar) participants.add(courrier.encodéPar);

    const droits = droitsAccès.get(courrierId) || [];
    droits.forEach((d) => participants.add(d.userId));

    participants.forEach((userId) => {
      if (userId !== auteurId && !mentionnéIds.includes(userId)) {
        addNotification({
          message: `Nouveau commentaire sur ${courrier.ref} par ${auteur.prenom} ${auteur.nom}`,
          niveau: "INFO",
          courrierId,
          type: "COMMENTAIRE",
          userId,
        });
      }
    });
  }

  return nouveauCommentaire;
}

export function marquerCommentaireLu(commentaireId: string, userId: string): void {
  const commentaire = commentaires.find((c) => c.id === commentaireId);
  if (commentaire && !commentaire.luPar?.includes(userId)) {
    commentaire.luPar = [...(commentaire.luPar || []), userId];
  }
}

// ========== DROITS D'ACCÈS / PARTAGE ==========

export function getDroitsAccès(courrierId: string): DroitAccès[] {
  return droitsAccès.get(courrierId) || [];
}

export function ajouterDroitAccès(
  courrierId: string,
  userId: string,
  permissions: ("LECTURE" | "ECRITURE" | "PARTAGE" | "SUPPRESSION")[],
  ajoutéPar: string
): DroitAccès {
  const user = getUserById(userId);
  if (!user) throw new Error("Utilisateur introuvable");

  const droits = droitsAccès.get(courrierId) || [];

  // Vérifier si l'utilisateur a déjà des droits
  const index = droits.findIndex((d) => d.userId === userId);

  const nouveauDroit: DroitAccès = {
    userId,
    userName: `${user.prenom} ${user.nom}`,
    permissions,
    dateAjout: new Date().toISOString(),
    ajoutéPar,
  };

  if (index >= 0) {
    droits[index] = nouveauDroit; // Mettre à jour
  } else {
    droits.push(nouveauDroit);
  }

  droitsAccès.set(courrierId, droits);

  // Mettre à jour le courrier
  const courrier = getCourrierById(courrierId);
  if (courrier) {
    updateCourrier(courrierId, {
      droitsAccès: droits,
    });
  }

  // Notifier l'utilisateur
  addNotification({
    message: `Vous avez reçu des droits d'accès sur le courrier ${courrier?.ref}`,
    niveau: "INFO",
    courrierId,
    type: "DROIT",
    userId,
  });

  return nouveauDroit;
}

export function retirerDroitAccès(courrierId: string, userId: string): void {
  const droits = droitsAccès.get(courrierId) || [];
  const nouveauxDroits = droits.filter((d) => d.userId !== userId);
  droitsAccès.set(courrierId, nouveauxDroits);

  const courrier = getCourrierById(courrierId);
  if (courrier) {
    updateCourrier(courrierId, {
      droitsAccès: nouveauxDroits,
    });
  }
}

export function aAccès(courrierId: string, userId: string, permission: "LECTURE" | "ECRITURE" | "PARTAGE" | "SUPPRESSION"): boolean {
  const courrier = getCourrierById(courrierId);
  if (!courrier) return false;

  // Le responsable actuel a tous les droits
  if (courrier.responsableActuel === userId) return true;

  // Vérifier les droits explicites
  const droits = droitsAccès.get(courrierId) || [];
  const droitUser = droits.find((d) => d.userId === userId);
  if (droitUser && droitUser.permissions.includes(permission)) return true;

  // Par défaut, lecture si dans le même service
  if (permission === "LECTURE") {
    const user = getUserById(userId);
    if (user && user.service === courrier.service) return true;
  }

  return false;
}

// ========== TRANSFERTS ==========

export function getTransferts(courrierId: string): Transfert[] {
  return transferts
    .filter((t) => t.courrierId === courrierId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function transfererCourrier(
  courrierId: string,
  deUserId: string,
  versUserId: string,
  raison?: string,
  nouveauStatut?: Courrier["statut"]
): Transfert {
  const courrier = getCourrierById(courrierId);
  if (!courrier) throw new Error("Courrier introuvable");

  const deUser = getUserById(deUserId);
  const versUser = getUserById(versUserId);
  if (!deUser || !versUser) throw new Error("Utilisateur introuvable");

  const transfert: Transfert = {
    id: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    courrierId,
    deUserId,
    deUserName: `${deUser.prenom} ${deUser.nom}`,
    versUserId,
    versUserName: `${versUser.prenom} ${versUser.nom}`,
    raison,
    date: new Date().toISOString(),
    statutAvant: courrier.statut,
    statutAprès: nouveauStatut,
  };

  transferts.push(transfert);

  // Mettre à jour le courrier
  updateCourrier(courrierId, {
    responsableActuel: versUserId,
    traitéPar: versUserId,
    statut: nouveauStatut || courrier.statut,
  });

  // Mettre à jour les transferts dans le courrier
  const transfertsCourrier = getTransferts(courrierId);
  const courrierUpdated = getCourrierById(courrierId);
  if (courrierUpdated) {
    updateCourrier(courrierId, {
      transferts: transfertsCourrier,
    });
  }

  // Notifier le destinataire
  addNotification({
    message: `${deUser.prenom} ${deUser.nom} vous a transféré le courrier ${courrier.ref}${raison ? ` : ${raison}` : ""}`,
    niveau: "ALERTE",
    courrierId,
    type: "TRANSFERT",
    userId: versUserId,
  });

  // Notifier l'expéditeur
  addNotification({
    message: `Vous avez transféré le courrier ${courrier.ref} à ${versUser.prenom} ${versUser.nom}`,
    niveau: "INFO",
    courrierId,
    type: "TRANSFERT",
    userId: deUserId,
  });

  return transfert;
}

// ========== UTILITAIRES ==========

export function getParticipantsCourrier(courrierId: string): User[] {
  const courrier = getCourrierById(courrierId);
  if (!courrier) return [];

  const participants = new Set<string>();

  if (courrier.responsableActuel) participants.add(courrier.responsableActuel);
  if (courrier.traitéPar) participants.add(courrier.traitéPar);
  if (courrier.encodéPar) participants.add(courrier.encodéPar);
  if (courrier.numériséPar) participants.add(courrier.numériséPar);
  if (courrier.validéPar) participants.add(courrier.validéPar);

  const droits = droitsAccès.get(courrierId) || [];
  droits.forEach((d) => participants.add(d.userId));

  const commentairesCourrier = getCommentaires(courrierId);
  commentairesCourrier.forEach((c) => participants.add(c.auteurId));

  return Array.from(participants)
    .map((id) => getUserById(id))
    .filter((u): u is User => u !== null);
}

