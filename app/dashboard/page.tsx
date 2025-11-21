"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";

export default function DashboardPage() {
  const { userBilleterie } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la billeterie
    if (userBilleterie) {
      switch (userBilleterie.role) {
        case "CLIENT":
          router.push("/client");
          break;
        case "AGENT":
          router.push("/agent");
          break;
        case "ADMIN_OPERATEUR":
          router.push("/admin");
          break;
        case "MINISTERE":
          router.push("/ministere");
          break;
      }
    } else {
      router.push("/login-simule");
    }
  }, [userBilleterie, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0033A0] via-[#002280] to-[#0033A0]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white">Redirection vers la plateforme de billeterie...</p>
      </div>
    </div>
  );
}
