"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div className="relative">
      {/* Animation de transition */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none ${
          isTransitioning ? "animate-page-transition" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0033A0] via-[#FFD200] to-[#0033A0] opacity-0 transition-opacity duration-300"></div>
      </div>

      {/* Contenu avec animation d'entrée */}
      <div
        className={`${
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        } transition-all duration-300`}
      >
        {displayChildren}
      </div>

      <style jsx>{`
        @keyframes page-transition {
          0% {
            opacity: 0;
            transform: scaleX(0);
            transform-origin: left;
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(0);
            transform-origin: right;
          }
        }

        .animate-page-transition {
          animation: page-transition 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}




