"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context";
import { getCourriers } from "@/lib/data";
import { Courrier } from "@/lib/types";

interface Commentaire {
  id: string;
  courrierId: string;
  auteur: string;
  role: string;
  message: string;
  date: string;
}

export default function CommentairesPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [nouveauCommentaire, setNouveauCommentaire] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Simuler des commentaires récents
      const courriers = getCourriers();
      const mockCommentaires: Commentaire[] = courriers.slice(0, 5).map((c, idx) => ({
        id: `comm-${idx}`,
        courrierId: c.id,
        auteur: user?.prenom + " " + user?.nom || "Utilisateur",
        role: user?.role || "AGENT",
        message: `Commentaire sur le courrier ${c.ref}`,
        date: new Date(Date.now() - idx * 3600000).toISOString(),
      }));
      setCommentaires(mockCommentaires);
    }
  }, [isOpen, user]);

  const handleAjouter = () => {
    if (!nouveauCommentaire.trim()) return;

    const nouveau: Commentaire = {
      id: `comm-${Date.now()}`,
      courrierId: "current",
      auteur: user?.prenom + " " + user?.nom || "Utilisateur",
      role: user?.role || "AGENT",
      message: nouveauCommentaire,
      date: new Date().toISOString(),
    };

    setCommentaires([nouveau, ...commentaires]);
    setNouveauCommentaire("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-xl shadow-modern-xl border border-slate-200/80 w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-[#0033A0]/5 to-transparent">
          <h2 className="text-lg font-semibold text-[#0033A0]">Commentaires</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-[#0033A0]"
          >
            ✕
          </button>
        </div>

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {commentaires.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3 filter drop-shadow-sm">💬</div>
              <p>Aucun commentaire</p>
            </div>
          ) : (
            commentaires.map((comm) => (
              <div
                key={comm.id}
                className="p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200/60 hover:border-[#0033A0]/40 hover:shadow-md hover:shadow-[#0033A0]/5 transition-all animate-slide-in"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-md shadow-[#0033A0]/30">
                    {comm.auteur[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 text-sm">{comm.auteur}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comm.date).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{comm.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input pour nouveau commentaire */}
        <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={nouveauCommentaire}
              onChange={(e) => setNouveauCommentaire(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAjouter()}
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50 transition-all"
            />
            <button
              onClick={handleAjouter}
              className="px-6 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-medium shadow-lg hover:shadow-xl hover:shadow-[#0033A0]/30 transform hover:scale-105 active:scale-95"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

