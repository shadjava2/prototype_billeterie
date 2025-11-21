// Fonction utilitaire pour formater les dates côté client uniquement
// Évite les erreurs d'hydratation Next.js
export function formatDateClient(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  if (typeof window === "undefined") return dateStr; // SSR : retourner la string brute

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatDateRelative(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  if (typeof window === "undefined") return dateStr; // SSR : retourner la string brute

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (minutes < 1440) return `Il y a ${Math.floor(minutes / 60)}h`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

