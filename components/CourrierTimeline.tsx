"use client";

import { Courrier } from "@/lib/types";
import { formatDateClient } from "@/lib/utils";

interface CourrierTimelineProps {
  courrier: Courrier;
}

interface TimelineStep {
  id: string;
  label: string;
  icon: string;
  statut: Courrier["statut"];
  date?: string;
  completed: boolean;
  current: boolean;
}

export default function CourrierTimeline({ courrier }: CourrierTimelineProps) {
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: "reception",
        label: "Réception",
        icon: "📥",
        statut: "RECU",
        date: courrier.dateRéception,
        completed: !!courrier.dateRéception,
        current: courrier.statut === "RECU",
      },
      {
        id: "numerisation",
        label: "Numérisation",
        icon: "📄",
        statut: "NUMERISE",
        date: courrier.dateNumérisation,
        completed: !!courrier.dateNumérisation,
        current: courrier.statut === "NUMERISE",
      },
      {
        id: "encodage",
        label: "Encodage",
        icon: "⌨️",
        statut: "EN_CIRCUIT",
        date: courrier.dateEncodage,
        completed: !!courrier.dateEncodage,
        current: courrier.statut === "EN_CIRCUIT",
      },
      {
        id: "transmission",
        label: "Transmission au service",
        icon: "📨",
        statut: "EN_CIRCUIT",
        date: courrier.dateEncodage,
        completed: !!courrier.service,
        current: false,
      },
      {
        id: "traitement",
        label: "Traitement par l'agent",
        icon: "📋",
        statut: "EN_CIRCUIT",
        date: courrier.dateTraitement,
        completed: !!courrier.dateTraitement,
        current: courrier.statut === "EN_CIRCUIT" && !!courrier.dateTraitement,
      },
      {
        id: "validation",
        label: "Validation par le directeur",
        icon: "✅",
        statut: "EN_ATTENTE_VALIDATION",
        date: courrier.dateValidation,
        completed: !!courrier.dateValidation,
        current: courrier.statut === "EN_ATTENTE_VALIDATION",
      },
      {
        id: "reponse",
        label: "Réponse / Courrier sortant",
        icon: "📤",
        statut: "REPONDU",
        date: courrier.liéÀ ? "Lien créé" : undefined,
        completed: !!courrier.liéÀ || courrier.type === "SORTANT",
        current: courrier.statut === "REPONDU",
      },
      {
        id: "archivage",
        label: "Archivage",
        icon: "📦",
        statut: "ARCHIVE",
        date: undefined,
        completed: courrier.statut === "ARCHIVE",
        current: courrier.statut === "ARCHIVE",
      },
    ];

    return steps;
  };

  const steps = getTimelineSteps();
  const currentStepIndex = steps.findIndex((s) => s.current || (!s.completed && s.date));
  const activeStepIndex = currentStepIndex >= 0 ? currentStepIndex : steps.findIndex((s) => !s.completed);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Workflow du courrier</h3>
      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const isActive = index === activeStepIndex;
            const isCompleted = step.completed;
            const isPast = index < activeStepIndex;

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Point de l'étape */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isActive
                      ? "bg-[#FFD200] border-[#0033A0] scale-110 shadow-lg"
                      : isCompleted
                      ? "bg-[#0033A0] border-[#0033A0]"
                      : "bg-white border-slate-300"
                  }`}
                >
                  <span className={`text-xl ${isCompleted || isActive ? "" : "opacity-50"}`}>
                    {step.icon}
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-[#FFD200] animate-ping opacity-75"></div>
                  )}
                </div>

                {/* Contenu de l'étape */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-semibold ${
                        isActive ? "text-[#0033A0]" : isCompleted ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 bg-[#FFD200] text-[#0033A0] rounded-full font-medium">
                        En cours
                      </span>
                    )}
                    {isCompleted && !isActive && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        ✓ Terminé
                      </span>
                    )}
                  </div>
                  {step.date && (
                    <p className="text-xs text-slate-600">
                      {typeof step.date === "string" && step.date.includes("T")
                        ? formatDateClient(step.date)
                        : step.date}
                    </p>
                  )}
                  {!step.completed && !isActive && (
                    <p className="text-xs text-slate-400 italic">En attente...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
