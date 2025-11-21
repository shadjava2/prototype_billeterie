"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourrierById, updateCourrier } from "@/lib/data";
import { Courrier } from "@/lib/types";
import QRCode from "react-qr-code";
import ChatCourrier from "@/components/ChatCourrier";
import GestionDroits from "@/components/GestionDroits";
import TransfertCourrier from "@/components/TransfertCourrier";
import { getTransferts, getParticipantsCourrier, aAccès } from "@/lib/collaboration";
import { getUserById } from "@/lib/auth";
import { formatDateClient } from "@/lib/utils";

export default function CourrierDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"infos" | "chat" | "droits" | "historique">("infos");
  const [showCollaboration, setShowCollaboration] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadCourrier = () => {
      const id = params.id as string;
      const found = getCourrierById(id);
      setCourrier(found || null);
      setLoading(false);
    };

    loadCourrier();
    const interval = setInterval(loadCourrier, 2000);
    return () => clearInterval(interval);
  }, [user, router, params]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0051A8] mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courrier) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-600">Courrier introuvable</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-6 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a]"
          >
            Retour au tableau de bord
          </button>
        </div>
      </Layout>
    );
  }

  const qrPayload = JSON.stringify({
    id: courrier.id,
    ref: courrier.ref,
    type: courrier.type,
    date: courrier.date,
    statut: courrier.statut,
  });

  const watermarkText = `Consultation: ${user?.prenom} ${user?.nom} (${user?.role}) - ${courrier.ref}`;
  const canModifier = user && aAccès(courrier.id, user.id, "ECRITURE");
  const participants = getParticipantsCourrier(courrier.id);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Watermark */}
        <div className="watermark select-none">{watermarkText}</div>

        {/* En-tête avec actions */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-slate-600 hover:text-slate-900 mb-2 flex items-center gap-1"
            >
              ← Retour
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{courrier.ref}</h1>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  courrier.statut === "ARCHIVE"
                    ? "bg-slate-100 text-slate-700"
                    : courrier.statut === "VALIDE"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {courrier.statut}
              </span>
              {courrier.priorité && (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    courrier.priorité === "TRES_URGENTE"
                      ? "bg-red-100 text-red-700"
                      : courrier.priorité === "URGENTE"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {courrier.priorité}
                </span>
              )}
            </div>
            <p className="text-slate-600 mt-1">{courrier.objet}</p>
          </div>
          <div className="flex gap-2">
            {courrier.responsableActuel === user?.id && (
              <TransfertCourrier
                courrier={courrier}
                onTransfert={() => {
                  const found = getCourrierById(courrier.id);
                  setCourrier(found || null);
                }}
              />
            )}
            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
            >
              {showCollaboration ? "Masquer" : "Afficher"} Collaboration
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Informations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Onglets */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-slate-200">
                <nav className="flex -mb-px">
                  {[
                    { id: "infos", label: "📋 Informations", icon: "📋" },
                    { id: "historique", label: "📜 Historique", icon: "📜" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-[#0051A8] text-[#0051A8]"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "infos" && (
                  <div className="space-y-6">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Type</label>
                        <div className="font-semibold text-slate-900">
                          {courrier.type === "ENTRANT" ? "Courrier entrant" : "Courrier sortant"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Date</label>
                        <div className="text-slate-900">{courrier.date}</div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
                          {courrier.type === "ENTRANT" ? "Expéditeur" : "Destinataire"}
                        </label>
                        <div className="text-slate-900">
                          {courrier.type === "ENTRANT" ? courrier.expéditeur : courrier.destinataire}
                        </div>
                      </div>
                      {courrier.service && (
                        <div>
                          <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Service</label>
                          <div className="text-slate-900">{courrier.service}</div>
                        </div>
                      )}
                    </div>

                    {courrier.observations && (
                      <div className="border-t pt-4">
                        <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Observations</label>
                        <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-900 whitespace-pre-wrap">
                          {courrier.observations}
                        </div>
                      </div>
                    )}

                    {/* Pièce jointe */}
                    {courrier.pièceJointe && (
                      <div className="border-t pt-4">
                        <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Pièce jointe</label>
                        <div className="border rounded-lg p-4 bg-slate-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-900">{courrier.pièceJointe}</span>
                            <a
                              href={`/courrier/${courrier.id}/print`}
                              target="_blank"
                              className="inline-block px-4 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] text-sm"
                            >
                              Imprimer
                            </a>
                          </div>
                          <div className="h-48 border border-dashed border-slate-300 bg-white flex items-center justify-center text-sm text-slate-500 rounded">
                            Aperçu du document PDF / scanné
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR Code */}
                    <div className="border-t pt-4">
                      <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">QR Code de vérification</label>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-white p-3 border rounded">
                          <QRCode value={qrPayload} size={120} />
                        </div>
                        <div className="text-sm text-slate-600">
                          <p className="font-medium mb-2">Sécurisation par QR code</p>
                          <p className="text-xs">
                            Ce QR code encode les informations essentielles du courrier. Il peut être scanné
                            pour vérifier l'authenticité du document.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "historique" && (
                  <div className="space-y-6">
                    {/* Responsable actuel */}
                    {courrier.responsableActuel && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Responsable actuel</div>
                        <div className="font-semibold text-blue-900">
                          {(() => {
                            const responsable = getUserById(courrier.responsableActuel || "");
                            return responsable ? `${responsable.prenom} ${responsable.nom} (${responsable.role})` : "N/A";
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Historique des transferts */}
                    {getTransferts(courrier.id).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Historique des transferts</h3>
                        <div className="space-y-3">
                          {getTransferts(courrier.id).map((transfert) => (
                            <div key={transfert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🔄</span>
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900">
                                    {transfert.deUserName} → {transfert.versUserName}
                                  </div>
                                  <div className="text-xs text-slate-600 mt-1">
                                    {formatDateClient(transfert.date)}
                                  </div>
                                </div>
                                <div className="text-xs">
                                  <span className="px-2 py-1 bg-slate-200 rounded">{transfert.statutAvant}</span>
                                  {transfert.statutAprès && (
                                    <>
                                      <span className="mx-2">→</span>
                                      <span className="px-2 py-1 bg-blue-200 rounded">{transfert.statutAprès}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {transfert.raison && (
                                <div className="text-sm text-slate-700 mt-2 p-2 bg-white rounded border border-slate-200">
                                  <strong>Raison :</strong> {transfert.raison}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chronologie */}
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Chronologie des actions</h3>
                      <div className="space-y-2 text-sm">
                        {courrier.dateRéception && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">📥 Réception</span>
                            <span className="text-slate-900">{formatDateClient(courrier.dateRéception)}</span>
                          </div>
                        )}
                        {courrier.dateNumérisation && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">📄 Numérisation</span>
                            <span className="text-slate-900">{formatDateClient(courrier.dateNumérisation)}</span>
                          </div>
                        )}
                        {courrier.dateEncodage && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">⌨️ Encodage</span>
                            <span className="text-slate-900">{formatDateClient(courrier.dateEncodage)}</span>
                          </div>
                        )}
                        {courrier.dateTraitement && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">📋 Traitement</span>
                            <span className="text-slate-900">{formatDateClient(courrier.dateTraitement)}</span>
                          </div>
                        )}
                        {courrier.dateValidation && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">✅ Validation</span>
                            <span className="text-slate-900">{formatDateClient(courrier.dateValidation)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Participants */}
                    {participants.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Participants ({participants.length})</h3>
                        <div className="flex flex-wrap gap-2">
                          {participants.map((p) => (
                            <div
                              key={p.id}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                            >
                              {p.prenom} {p.nom} ({p.role})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne latérale - Collaboration */}
          {showCollaboration && (
            <div className="space-y-6">
              {/* Chat */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">💬 Discussion</h3>
                  <button
                    onClick={() => setActiveTab(activeTab === "chat" ? "infos" : "chat")}
                    className="text-xs text-[#0051A8] hover:underline"
                  >
                    {activeTab === "chat" ? "Voir infos" : "Ouvrir"}
                  </button>
                </div>
                <ChatCourrier courrierId={courrier.id} />
              </div>

              {/* Droits d'accès */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">🔐 Droits d'accès</h3>
                  <button
                    onClick={() => setActiveTab(activeTab === "droits" ? "infos" : "droits")}
                    className="text-xs text-[#0051A8] hover:underline"
                  >
                    {activeTab === "droits" ? "Voir infos" : "Gérer"}
                  </button>
                </div>
                <GestionDroits courrierId={courrier.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

