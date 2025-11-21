"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context";

export default function PartagerPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [lien, setLien] = useState("");
  const [email, setEmail] = useState("");
  const [copieReussie, setCopieReussie] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setLien(window.location.href);
    }
  }, [isOpen]);

  const handleCopier = async () => {
    if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(lien);
      setCopieReussie(true);
      setTimeout(() => setCopieReussie(false), 2000);
    }
  };

  const handlePartager = () => {
    // Simulation d'envoi
    alert(`Lien partagé avec ${email}`);
    setEmail("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-xl shadow-modern-xl border border-slate-200/80 w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-[#0033A0]/5 to-transparent">
          <h2 className="text-lg font-semibold text-[#0033A0]">Partager</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-[#0033A0]"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lien de partage
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={lien}
                readOnly
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-sm"
              />
              <button
                onClick={handleCopier}
                className={`px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                  copieReussie
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30"
                    : "bg-gradient-to-r from-[#0033A0] to-[#002280] text-white hover:from-[#002280] hover:to-[#0033A0] shadow-[#0033A0]/30"
                }`}
              >
                {copieReussie ? "✓ Copié" : "Copier"}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200/60 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Partager par email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]/50 transition-all"
              />
              <button
                onClick={handlePartager}
                className="px-6 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-medium shadow-lg hover:shadow-xl hover:shadow-[#0033A0]/30 transform hover:scale-105 active:scale-95"
              >
                Envoyer
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>Note :</strong> Le partage est limité aux utilisateurs autorisés du système.
          </div>
        </div>
      </div>
    </div>
  );
}

