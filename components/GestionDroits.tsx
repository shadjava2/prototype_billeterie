"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context";
import {
  getDroitsAccès,
  ajouterDroitAccès,
  retirerDroitAccès,
  aAccès,
} from "@/lib/collaboration";
import { DroitAccès } from "@/lib/types";
import { MOCK_USERS } from "@/lib/auth";

interface GestionDroitsProps {
  courrierId: string;
}

export default function GestionDroits({ courrierId }: GestionDroitsProps) {
  const { user } = useAuth();
  const [droits, setDroits] = useState<DroitAccès[]>([]);
  const [showAjout, setShowAjout] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    ("LECTURE" | "ECRITURE" | "PARTAGE" | "SUPPRESSION")[]
  >(["LECTURE"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDroits = () => {
      setDroits(getDroitsAccès(courrierId));
    };
    loadDroits();
    const interval = setInterval(loadDroits, 2000);
    return () => clearInterval(interval);
  }, [courrierId]);

  const handleAjouter = async () => {
    if (!selectedUser || !user) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Animation
      ajouterDroitAccès(courrierId, selectedUser, selectedPermissions, user.id);
      setShowAjout(false);
      setSelectedUser("");
      setSelectedPermissions(["LECTURE"]);
    } catch (error) {
      alert("Erreur lors de l'ajout des droits");
    } finally {
      setLoading(false);
    }
  };

  const handleRetirer = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer les droits de cet utilisateur ?")) return;

    try {
      retirerDroitAccès(courrierId, userId);
    } catch (error) {
      alert("Erreur lors du retrait des droits");
    }
  };

  const togglePermission = (perm: "LECTURE" | "ECRITURE" | "PARTAGE" | "SUPPRESSION") => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const canGérer = user && aAccès(courrierId, user.id, "PARTAGE");

  if (!canGérer) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg shadow border border-slate-200 p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔐</span>
          <h3 className="font-semibold text-slate-900">Droits d'accès</h3>
        </div>
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <span className="text-xs">ℹ️</span>
          Vous n'avez pas les permissions pour gérer les droits d'accès.
        </p>
        <button
          onClick={() => {
            // Demander les droits de partage
            if (user && confirm("Souhaitez-vous demander les droits de partage sur ce courrier ?")) {
              // Simuler une demande
              alert("Demande de droits envoyée au responsable du courrier");
            }
          }}
          className="mt-3 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Demander les droits
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔐</span>
          <h3 className="font-semibold text-slate-900">Partage & Droits</h3>
        </div>
        <button
          onClick={() => setShowAjout(!showAjout)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 ${
            showAjout
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-gradient-to-r from-[#0051A8] to-[#003d7a] text-white hover:from-[#003d7a] hover:to-[#002855] shadow-md hover:shadow-lg"
          }`}
        >
          {showAjout ? "✕ Annuler" : "+ Partager"}
        </button>
      </div>

      {showAjout && (
        <div className="mb-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 space-y-4 animate-slide-in shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👥</span>
            <h4 className="font-semibold text-slate-900">Partager avec un utilisateur</h4>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1">
              <span>👤</span>
              Utilisateur
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0051A8] focus:border-[#0051A8] outline-none transition-all hover:border-slate-400"
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
            <label className="block text-xs font-medium text-slate-700 mb-3 flex items-center gap-1">
              <span>🔑</span>
              Permissions à accorder
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["LECTURE", "ECRITURE", "PARTAGE", "SUPPRESSION"] as const).map((perm) => {
                const isSelected = selectedPermissions.includes(perm);
                const icons: Record<string, { icon: string; label: string; color: string }> = {
                  LECTURE: { icon: "📖", label: "Lecture", color: "blue" },
                  ECRITURE: { icon: "✏️", label: "Écriture", color: "green" },
                  PARTAGE: { icon: "🔗", label: "Partage", color: "purple" },
                  SUPPRESSION: { icon: "🗑️", label: "Suppression", color: "red" },
                };
                const permInfo = icons[perm];

                return (
                  <label
                    key={perm}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                      isSelected
                        ? `border-${permInfo.color}-500 bg-${permInfo.color}-50`
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePermission(perm)}
                      className="w-4 h-4 rounded border-2 border-slate-300 text-[#0051A8] focus:ring-2 focus:ring-[#0051A8]"
                    />
                    <span className="text-lg">{permInfo.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{permInfo.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAjouter}
              disabled={!selectedUser || selectedPermissions.length === 0 || loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#0051A8] to-[#003d7a] text-white rounded-lg hover:from-[#003d7a] hover:to-[#002855] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Ajout...</span>
                </>
              ) : (
                <>
                  <span>✓ Partager</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowAjout(false);
                setSelectedUser("");
                setSelectedPermissions(["LECTURE"]);
              }}
              className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {droits.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 animate-fade-in">
            <div className="text-4xl mb-2">🔒</div>
            <p className="text-sm text-slate-500 font-medium">Aucun partage configuré</p>
            <p className="text-xs text-slate-400 mt-1">Cliquez sur "Partager" pour ajouter des utilisateurs</p>
          </div>
        ) : (
          droits.map((droit, index) => (
            <div
              key={droit.userId}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 rounded-xl border-2 border-slate-200 hover:border-[#0051A8] transition-all transform hover:scale-[1.02] hover:shadow-md animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👤</span>
                  <div className="font-semibold text-sm text-slate-900">{droit.userName}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {droit.permissions.map((p) => {
                    const icons: Record<string, { icon: string; color: string }> = {
                      LECTURE: { icon: "📖", color: "bg-blue-100 text-blue-700" },
                      ECRITURE: { icon: "✏️", color: "bg-green-100 text-green-700" },
                      PARTAGE: { icon: "🔗", color: "bg-purple-100 text-purple-700" },
                      SUPPRESSION: { icon: "🗑️", color: "bg-red-100 text-red-700" },
                    };
                    const permInfo = icons[p] || { icon: p, color: "bg-slate-100 text-slate-700" };
                    return (
                      <span
                        key={p}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${permInfo.color}`}
                      >
                        {permInfo.icon} {p}
                      </span>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <span>📅</span>
                  Ajouté le {new Date(droit.dateAjout).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <button
                onClick={() => handleRetirer(droit.userId)}
                className="ml-4 px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium transform hover:scale-110 flex items-center gap-1"
              >
                <span>✕</span>
                Retirer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
