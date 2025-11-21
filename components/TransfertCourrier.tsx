"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context";
import { transfererCourrier, getTransferts } from "@/lib/collaboration";
import { Courrier, CourrierStatut } from "@/lib/types";
import { MOCK_USERS } from "@/lib/auth";

interface TransfertCourrierProps {
  courrier: Courrier;
  onTransfert?: () => void;
}

export default function TransfertCourrier({ courrier, onTransfert }: TransfertCourrierProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [versUserId, setVersUserId] = useState("");
  const [raison, setRaison] = useState("");
  const [nouveauStatut, setNouveauStatut] = useState<CourrierStatut | "">("");
  const [loading, setLoading] = useState(false);

  const transferts = getTransferts(courrier.id);

  const handleTransfert = async () => {
    if (!versUserId || !user) return;

    setLoading(true);
    try {
      transfererCourrier(
        courrier.id,
        user.id,
        versUserId,
        raison || undefined,
        nouveauStatut || undefined
      );
      setShowModal(false);
      setVersUserId("");
      setRaison("");
      setNouveauStatut("");
      if (onTransfert) onTransfert();
    } catch (error) {
      alert("Erreur lors du transfert");
    } finally {
      setLoading(false);
    }
  };

  const canTransferer = user && (user.id === courrier.responsableActuel || user.role === "ADMIN" || user.role === "DIRECTEUR");

  if (!canTransferer) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
      >
        <span>🔄</span>
        <span>Transférer</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-2xl">
                🔄
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Transférer le traitement
                </h3>
                <p className="text-xs text-slate-500">{courrier.ref}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transférer à <span className="text-red-500">*</span>
                </label>
                <select
                  value={versUserId}
                  onChange={(e) => setVersUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {MOCK_USERS.filter((u) => u.id !== user?.id).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom} ({u.role}) - {u.service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nouveau statut (optionnel)
                </label>
                <select
                  value={nouveauStatut}
                  onChange={(e) => setNouveauStatut(e.target.value as CourrierStatut | "")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Conserver le statut actuel</option>
                  <option value="EN_CIRCUIT">En circuit</option>
                  <option value="EN_ATTENTE_VALIDATION">En attente de validation</option>
                  <option value="VALIDE">Validé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Raison du transfert
                </label>
                <textarea
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Expliquez la raison du transfert..."
                />
              </div>

              {transferts.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-900 mb-2">
                    Historique des transferts ({transferts.length})
                  </p>
                  <div className="space-y-1 text-xs text-amber-800">
                    {transferts.slice(0, 3).map((t) => (
                      <div key={t.id}>
                        {t.deUserName} → {t.versUserName}
                        {t.raison && ` : ${t.raison}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleTransfert}
                disabled={!versUserId || loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0051A8] to-[#003d7a] text-white rounded-lg hover:from-[#003d7a] hover:to-[#002855] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Transfert...</span>
                  </>
                ) : (
                  <>
                    <span>✓ Confirmer</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setVersUserId("");
                  setRaison("");
                  setNouveauStatut("");
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

