import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context";
import { BilleterieProvider } from "@/lib/billeterie-context";

export const metadata: Metadata = {
  title: "Plateforme Nationale de Billeterie - Ministère des Transports",
  description: "Plateforme nationale de billeterie pour les entreprises publiques de transport (RDC)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0033A0" />
      </head>
      <body className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 relative">
        <AuthProvider>
          <BilleterieProvider>{children}</BilleterieProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
