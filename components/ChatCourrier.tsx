"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/context";
import {
  getCommentaires,
  addCommentaire,
  marquerCommentaireLu,
  getParticipantsCourrier,
} from "@/lib/collaboration";
import { Commentaire, User } from "@/lib/types";
import { MOCK_USERS } from "@/lib/auth";
import { formatDateRelative } from "@/lib/utils";

interface ChatCourrierProps {
  courrierId: string;
}

export default function ChatCourrier({ courrierId }: ChatCourrierProps) {
  const { user } = useAuth();
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState<"COMMENTAIRE" | "AVIS" | "QUESTION" | "REPONSE">("COMMENTAIRE");
  const [participants, setParticipants] = useState<User[]>([]);
  const [mention, setMention] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previousCommentairesLength = useRef(0);

  useEffect(() => {
    const loadData = () => {
      const newCommentaires = getCommentaires(courrierId);
      setParticipants(getParticipantsCourrier(courrierId));

      // Vérifier si un nouveau commentaire a été ajouté (pas juste une mise à jour)
      if (newCommentaires.length > previousCommentairesLength.current) {
        // Seulement si c'est l'utilisateur actuel qui a ajouté le commentaire
        const lastComment = newCommentaires[0];
        if (lastComment && lastComment.auteurId === user?.id) {
          setShouldScroll(true);
        }
      }

      setCommentaires(newCommentaires);
      previousCommentairesLength.current = newCommentaires.length;

      // Marquer les commentaires comme lus
      if (user) {
        newCommentaires.forEach((c) => {
          if (c.auteurId !== user.id) {
            marquerCommentaireLu(c.id, user.id);
          }
        });
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [courrierId, user]);

  useEffect(() => {
    if (shouldScroll) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShouldScroll(false);
      }, 100);
    }
  }, [shouldScroll]);

  useEffect(() => {
    if (mention.startsWith("@")) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [mention]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauMessage.trim() || !user) return;

    setIsTyping(true);

    try {
      const mentionnéIds = mention
        ? participants
            .filter((p) =>
              p.nom.toLowerCase().includes(mention.toLowerCase().replace("@", "")) ||
              p.prenom.toLowerCase().includes(mention.toLowerCase().replace("@", ""))
            )
            .map((p) => p.id)
        : [];

      addCommentaire(courrierId, user.id, nouveauMessage, typeMessage, mentionnéIds);
      setNouveauMessage("");
      setMention("");
      setTypeMessage("COMMENTAIRE");
      setIsTyping(false);
      setShouldScroll(true); // Activer le scroll uniquement après l'envoi

      // Focus sur l'input après envoi
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      alert("Erreur lors de l'ajout du commentaire");
      setIsTyping(false);
    }
  };

  const handleMentionSelect = (participant: User) => {
    setMention(`@${participant.prenom} ${participant.nom}`);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "AVIS":
        return "💡";
      case "QUESTION":
        return "❓";
      case "REPONSE":
        return "💬";
      default:
        return "💭";
    }
  };

  const filteredParticipants = mention.startsWith("@")
    ? participants.filter((p) =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(mention.toLowerCase().replace("@", ""))
      )
    : [];

  return (
    <div className="flex flex-col h-[350px] max-h-[350px] overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Discussion & Commentaires</h3>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {commentaires.length} message{commentaires.length > 1 ? "s" : ""} • {participants.length} participant{participants.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-1">
            {(["COMMENTAIRE", "AVIS", "QUESTION", "REPONSE"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeMessage(type)}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  typeMessage === type
                    ? "bg-[#0051A8] text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {getTypeIcon(type)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-slate-50">
        {commentaires.length === 0 ? (
          <div className="text-center text-slate-500 py-12 animate-fade-in">
            <div className="text-5xl mb-3 animate-bounce-slow">💬</div>
            <p className="text-sm font-medium">Aucun commentaire pour le moment</p>
            <p className="text-xs mt-2">Soyez le premier à commenter</p>
          </div>
        ) : (
          commentaires.map((commentaire, index) => {
            const isMine = commentaire.auteurId === user?.id;
            const isLu = commentaire.luPar?.includes(user?.id || "");

            return (
              <div
                key={commentaire.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"} animate-slide-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                    isMine
                      ? "bg-gradient-to-br from-[#0051A8] to-[#003d7a] text-white"
                      : "bg-white border border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{getTypeIcon(commentaire.type)}</span>
                    <span className={`text-xs font-semibold ${isMine ? "text-white/90" : "text-slate-700"}`}>
                      {commentaire.auteurNom}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isMine ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {commentaire.auteurRole}
                    </span>
                  </div>
                  <div className={`text-sm ${isMine ? "text-white" : "text-slate-900"} whitespace-pre-wrap leading-relaxed`}>
                    {commentaire.contenu}
                  </div>
                  {commentaire.mentionnéIds && commentaire.mentionnéIds.length > 0 && (
                    <div className={`text-xs mt-2 flex items-center gap-1 ${
                      isMine ? "text-white/80" : "text-blue-600"
                    }`}>
                      <span>@</span>
                      {commentaire.mentionnéIds.map((id) => {
                        const p = participants.find((p) => p.id === id);
                        return p ? `${p.prenom} ${p.nom}` : "";
                      }).filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className={`text-xs mt-2 flex items-center gap-2 ${
                    isMine ? "text-white/60" : "text-slate-400"
                  }`}>
                    <span>{formatDateRelative(commentaire.date)}</span>
                    {!isMine && !isLu && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    )}
                    {isMine && (
                      <span className="text-white/40">✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-end animate-fade-in">
            <div className="bg-slate-100 rounded-2xl p-3 flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire amélioré */}
      {user && (
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Barre d'outils */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={typeMessage}
                onChange={(e) => setTypeMessage(e.target.value as any)}
                className="text-xs px-3 py-1.5 border-2 border-slate-300 rounded-lg bg-white hover:border-[#0051A8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0051A8]"
              >
                <option value="COMMENTAIRE">💭 Commentaire</option>
                <option value="AVIS">💡 Avis</option>
                <option value="QUESTION">❓ Question</option>
                <option value="REPONSE">💬 Réponse</option>
              </select>

              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={mention}
                  onChange={(e) => setMention(e.target.value)}
                  placeholder="@Mentionner..."
                  className="w-full text-xs px-3 py-1.5 border-2 border-slate-300 rounded-lg focus:border-[#0051A8] focus:ring-2 focus:ring-[#0051A8] outline-none transition-all"
                />
                {showMentions && filteredParticipants.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-slate-200 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                    {filteredParticipants.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleMentionSelect(p)}
                        className="w-full text-left px-3 py-2 hover:bg-[#0051A8]/10 transition-colors flex items-center gap-2"
                      >
                        <span className="text-sm">{getRoleIcon(p.role)}</span>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{p.prenom} {p.nom}</div>
                          <div className="text-xs text-slate-500">{p.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone de texte avec actions */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={nouveauMessage}
                onChange={(e) => {
                  setNouveauMessage(e.target.value);
                  if (e.target.value.includes("@")) {
                    const atIndex = e.target.value.lastIndexOf("@");
                    setMention(e.target.value.substring(atIndex));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleSubmit(e as any);
                  }
                }}
                placeholder={`Écrivez votre ${typeMessage.toLowerCase()}... (Ctrl+Entrée pour envoyer)`}
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0051A8] focus:border-[#0051A8] outline-none resize-none transition-all hover:border-slate-400"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {nouveauMessage.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!nouveauMessage.trim() || isTyping}
                  className="px-4 py-2 bg-gradient-to-r from-[#0051A8] to-[#003d7a] text-white rounded-lg hover:from-[#003d7a] hover:to-[#002855] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {isTyping ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <span>Envoyer</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function getRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    RECEPTIONNISTE: "📥",
    AGENT: "👤",
    DIRECTEUR: "👔",
    ADMIN: "⚙️",
    VISITEUR: "👁️",
  };
  return icons[role] || "👤";
}
