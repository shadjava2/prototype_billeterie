"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context";
import { getCourriers } from "@/lib/data";
import { Courrier } from "@/lib/types";
import Link from "next/link";

interface Suggestion {
  id: string;
  type: "ALERTE" | "RECOMMANDATION" | "RAPPEL";
  message: string;
  action?: string;
  actionHref?: string;
  date: string;
  priorité: "HAUTE" | "MOYENNE" | "BASSE";
}

export default function AssistantIA() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const generateSuggestions = () => {
      const courriers = getCourriers();
      const newSuggestions: Suggestion[] = [];

      // Analyser les courriers en retard
      const maintenant = new Date();
      courriers.forEach((courrier) => {
        if (courrier.dateLimiteTraitement) {
          const dateLimite = new Date(courrier.dateLimiteTraitement);
          const joursRetard = Math.floor((maintenant.getTime() - dateLimite.getTime()) / (1000 * 60 * 60 * 24));

          if (joursRetard > 0 && courrier.statut !== "ARCHIVE" && courrier.statut !== "VALIDE") {
            newSuggestions.push({
              id: `retard-${courrier.id}`,
              type: "ALERTE",
              message: `Le courrier ${courrier.ref} est en retard de ${joursRetard} jour${joursRetard > 1 ? "s" : ""}.`,
              action: "Voir le courrier",
              actionHref: `/courrier/${courrier.id}`,
              date: new Date().toISOString(),
              priorité: joursRetard > 3 ? "HAUTE" : "MOYENNE",
            });
          }
        }
      });

      // Analyser les courriers urgents en attente
      const urgentsEnAttente = courriers.filter(
        (c) =>
          (c.priorité === "URGENTE" || c.priorité === "TRES_URGENTE") &&
          (c.statut === "EN_CIRCUIT" || c.statut === "EN_ATTENTE_VALIDATION")
      );

      if (urgentsEnAttente.length > 0) {
        newSuggestions.push({
          id: "urgents-attente",
          type: "ALERTE",
          message: `${urgentsEnAttente.length} courrier${urgentsEnAttente.length > 1 ? "s" : ""} urgent${urgentsEnAttente.length > 1 ? "s" : ""} en attente de traitement.`,
          action: "Voir les courriers urgents",
          actionHref: "/courriers-entrants?filtre=urgent",
          date: new Date().toISOString(),
          priorité: "HAUTE",
        });
      }

      // Analyser les délais moyens par service
      const services = ["Cabinet", "Secrétariat Général", "Inspection"];
      services.forEach((service) => {
        const courriersService = courriers.filter(
          (c) => c.service === service && c.dateTraitement && c.dateRéception
        );

        if (courriersService.length > 3) {
          const delaisMoyens = courriersService.map((c) => {
            const reception = new Date(c.dateRéception!);
            const traitement = new Date(c.dateTraitement!);
            return Math.floor((traitement.getTime() - reception.getTime()) / (1000 * 60 * 60 * 24));
          });

          const delaiMoyen = delaisMoyens.reduce((a, b) => a + b, 0) / delaisMoyens.length;

          if (delaiMoyen > 5) {
            newSuggestions.push({
              id: `delai-${service}`,
              type: "RECOMMANDATION",
              message: `Le délai moyen de traitement dépasse ${Math.round(delaiMoyen)} jours pour le service ${service}.`,
              date: new Date().toISOString(),
              priorité: "MOYENNE",
            });
          }
        }
      });

      // Recommandations basées sur les courriers non traités depuis longtemps
      const nonTraites = courriers.filter(
        (c) =>
          c.statut === "EN_CIRCUIT" &&
          c.dateRéception &&
          new Date(c.dateRéception).getTime() < maintenant.getTime() - 7 * 24 * 60 * 60 * 1000
      );

      if (nonTraites.length > 0) {
        newSuggestions.push({
          id: "non-traites",
          type: "RAPPEL",
          message: `${nonTraites.length} courrier${nonTraites.length > 1 ? "s" : ""} non traité${nonTraites.length > 1 ? "s" : ""} depuis plus de 7 jours.`,
          action: "Voir les courriers en attente",
          actionHref: "/workflow",
          date: new Date().toISOString(),
          priorité: "MOYENNE",
        });
      }

      // Trier par priorité et date
      newSuggestions.sort((a, b) => {
        const prioritéOrder = { HAUTE: 0, MOYENNE: 1, BASSE: 2 };
        if (prioritéOrder[a.priorité] !== prioritéOrder[b.priorité]) {
          return prioritéOrder[a.priorité] - prioritéOrder[b.priorité];
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setSuggestions(newSuggestions.slice(0, 10)); // Limiter à 10 suggestions
    };

    generateSuggestions();
    const interval = setInterval(generateSuggestions, 30000); // Mise à jour toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#0033A0] to-[#002280] rounded-lg border border-[#0033A0]/20 p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🤖</span>
          <h2 className="text-2xl font-bold">Assistant numérique</h2>
        </div>
        <p className="text-white/80 text-sm">
          Votre assistant IA analyse les courriers et vous propose des recommandations en temps réel.
        </p>
      </div>

      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-slate-600">Aucune suggestion pour le moment. Tout est à jour !</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`bg-white border border-slate-200 rounded-lg p-3 border-l-4 ${
                suggestion.type === "ALERTE"
                  ? "border-red-500"
                  : suggestion.type === "RECOMMANDATION"
                  ? "border-blue-500"
                  : "border-amber-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {suggestion.type === "ALERTE"
                    ? "⚠️"
                    : suggestion.type === "RECOMMANDATION"
                    ? "💡"
                    : "🔔"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        suggestion.priorité === "HAUTE"
                          ? "bg-red-100 text-red-700"
                          : suggestion.priorité === "MOYENNE"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {suggestion.priorité}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(suggestion.date).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-slate-900 font-medium">{suggestion.message}</p>
                  {suggestion.action && suggestion.actionHref && (
                    <Link
                      href={suggestion.actionHref}
                      className="inline-block mt-2 text-sm text-[#0033A0] hover:underline font-medium"
                    >
                      → {suggestion.action}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

