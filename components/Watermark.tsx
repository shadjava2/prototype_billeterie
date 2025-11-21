"use client";

import { useAuth } from "@/lib/context";

interface WatermarkProps {
  text?: string;
  courrierRef?: string;
}

export default function Watermark({ text, courrierRef }: WatermarkProps) {
  const { user } = useAuth();

  if (!user) return null;

  const watermarkText =
    text ||
    `Consulté par ${user.prenom} ${user.nom} – ${user.role} – ${new Date().toLocaleString("fr-FR")}${courrierRef ? ` – ${courrierRef}` : ""}`;

  return (
    <div className="watermark select-none pointer-events-none">
      {watermarkText}
    </div>
  );
}
