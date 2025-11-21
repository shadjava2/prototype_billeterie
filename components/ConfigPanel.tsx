"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context";
import { useRouter } from "next/navigation";

export default function ConfigPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [notifications, setNotifications] = useState(true);
  const [langue, setLangue] = useState("fr");

  const handleLogout = () => {
    logout();
    router.push("/login");
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
          <h2 className="text-lg font-semibold text-[#0033A0]">Paramètres</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-[#0033A0]"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Profil */}
          <div>
            <h3 className="text-sm font-semibold text-[#0033A0] mb-3">Profil</h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200/60">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center text-white font-semibold shadow-md shadow-[#0033A0]/30">
                {user?.prenom[0]}{user?.nom[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  {user?.prenom} {user?.nom}
                </div>
                <div className="text-sm text-slate-600">{user?.email}</div>
                <div className="text-xs text-slate-500 mt-1">{user?.role} - {user?.service}</div>
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div>
            <h3 className="text-sm font-semibold text-[#0033A0] mb-3">Préférences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200/60">
                <div>
                  <div className="font-medium text-slate-900 text-sm">Thème</div>
                  <div className="text-xs text-slate-500">Apparence de l'interface</div>
                </div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="px-3 py-1.5 border border-slate-200 rounded-md text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200/60">
                <div>
                  <div className="font-medium text-slate-900 text-sm">Notifications</div>
                  <div className="text-xs text-slate-500">Activer les notifications</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0033A0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0033A0]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200/60">
                <div>
                  <div className="font-medium text-slate-900 text-sm">Langue</div>
                  <div className="text-xs text-slate-500">Langue de l'interface</div>
                </div>
                <select
                  value={langue}
                  onChange={(e) => setLangue(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-md text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200/60 pt-4 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all font-medium border border-red-200 hover:border-red-300 shadow-md hover:shadow-lg hover:shadow-red-200/50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

