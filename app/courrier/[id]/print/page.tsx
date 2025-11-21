"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCourrierById } from "@/lib/data";
import { Courrier } from "@/lib/types";
import QRCode from "react-qr-code";

export default function PrintPage() {
  const params = useParams();
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const found = getCourrierById(id);
    setCourrier(found || null);
    setLoading(false);

    // Auto-impression après chargement
    if (found) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!courrier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Courrier introuvable</p>
      </div>
    );
  }

  const qrPayload = JSON.stringify({
    id: courrier.id,
    ref: courrier.ref,
    type: courrier.type,
    date: courrier.date,
    statut: courrier.statut,
  });

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>

      {/* En-tête */}
      <div className="mb-8 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-600 mb-1">
              République Démocratique du Congo
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              Ministère du Transport
            </div>
            <div className="text-sm text-slate-700">
              Voies de Communication et Désenclavement
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 mb-1">Système de gestion électronique</div>
            <div className="text-xs text-slate-600">du courrier</div>
          </div>
        </div>
      </div>

      {/* Badge Document Numérisé */}
      <div className="mb-6 text-center">
        <div className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold text-lg">
          DOCUMENT NUMÉRISÉ
        </div>
      </div>

      {/* Informations du courrier */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Référence</div>
            <div className="text-lg font-bold text-slate-900">{courrier.ref}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Date</div>
            <div className="text-lg font-semibold text-slate-900">
              {new Date(courrier.date).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Type de courrier</div>
          <div className="text-base font-semibold text-slate-900">
            {courrier.type === "ENTRANT" ? "Courrier Entrant" : "Courrier Sortant"}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Objet</div>
          <div className="text-base font-semibold text-slate-900 border-l-4 border-[#0051A8] pl-3 py-2">
            {courrier.objet}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">
              {courrier.type === "ENTRANT" ? "Expéditeur" : "Destinataire"}
            </div>
            <div className="text-base text-slate-900">{courrier.type === "ENTRANT" ? courrier.expéditeur : courrier.destinataire}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">
              {courrier.type === "ENTRANT" ? "Destinataire" : "Expéditeur"}
            </div>
            <div className="text-base text-slate-900">{courrier.type === "ENTRANT" ? courrier.destinataire : courrier.expéditeur}</div>
          </div>
        </div>

        {courrier.service && (
          <div>
            <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Service en charge</div>
            <div className="text-base text-slate-900">{courrier.service}</div>
          </div>
        )}

        <div>
          <div className="text-xs text-slate-600 uppercase tracking-wide mb-1">Statut</div>
          <div className="inline-block px-3 py-1 bg-slate-100 text-slate-900 rounded font-semibold text-sm">
            {courrier.statut}
          </div>
        </div>
      </div>

      {/* Zone de contenu du document */}
      <div className="mb-8 border-2 border-dashed border-slate-300 p-8 min-h-[300px]">
        <div className="text-center text-slate-500 mb-4">
          <div className="text-sm font-semibold mb-2">CONTENU DU DOCUMENT NUMÉRISÉ</div>
          <div className="text-xs">Aperçu du document scanné</div>
        </div>
        {courrier.pièceJointe && (
          <div className="text-xs text-slate-400 text-center mt-4">
            Fichier : {courrier.pièceJointe}
          </div>
        )}
      </div>

      {/* Observations si présentes */}
      {courrier.observations && (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded">
          <div className="text-xs text-slate-600 uppercase tracking-wide mb-2">Observations</div>
          <div className="text-sm text-slate-900 whitespace-pre-wrap">{courrier.observations}</div>
        </div>
      )}

      {/* Historique */}
      <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded">
        <div className="text-xs text-slate-600 uppercase tracking-wide mb-3">Historique du traitement</div>
        <div className="space-y-2 text-xs">
          {courrier.dateRéception && (
            <div className="flex justify-between">
              <span className="text-slate-600">Date de réception :</span>
              <span className="text-slate-900 font-medium">
                {new Date(courrier.dateRéception).toLocaleString("fr-FR")}
              </span>
            </div>
          )}
          {courrier.dateNumérisation && (
            <div className="flex justify-between">
              <span className="text-slate-600">Date de numérisation :</span>
              <span className="text-slate-900 font-medium">
                {new Date(courrier.dateNumérisation).toLocaleString("fr-FR")}
              </span>
            </div>
          )}
          {courrier.dateEncodage && (
            <div className="flex justify-between">
              <span className="text-slate-600">Date d'encodage :</span>
              <span className="text-slate-900 font-medium">
                {new Date(courrier.dateEncodage).toLocaleString("fr-FR")}
              </span>
            </div>
          )}
          {courrier.dateTraitement && (
            <div className="flex justify-between">
              <span className="text-slate-600">Date de traitement :</span>
              <span className="text-slate-900 font-medium">
                {new Date(courrier.dateTraitement).toLocaleString("fr-FR")}
              </span>
            </div>
          )}
          {courrier.dateValidation && (
            <div className="flex justify-between">
              <span className="text-slate-600">Date de validation :</span>
              <span className="text-slate-900 font-medium">
                {new Date(courrier.dateValidation).toLocaleString("fr-FR")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* QR Code et authentification */}
      <div className="border-t-2 border-slate-900 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-slate-600 uppercase tracking-wide mb-2">
              Code de vérification
            </div>
            <div className="text-xs text-slate-700 mb-4">
              Ce QR code permet de vérifier l'authenticité de ce document numérisé.
              Scannez-le avec l'application mobile du ministère pour accéder aux détails complets.
            </div>
            <div className="text-xs text-slate-500">
              ID Document : {courrier.id}
            </div>
          </div>
          <div className="ml-8 p-4 bg-white border-2 border-slate-900 rounded">
            <QRCode value={qrPayload} size={150} />
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
        <div>Document généré le {new Date().toLocaleString("fr-FR")}</div>
        <div className="mt-1">Système de gestion électronique du courrier - Ministère du Transport</div>
        <div className="mt-1">COSOFT & ICT Solutions - Programme de numérisation 2025–2027</div>
      </div>

      {/* Bouton retour (masqué à l'impression) */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors"
        >
          Retour
        </button>
      </div>
    </div>
  );
}

