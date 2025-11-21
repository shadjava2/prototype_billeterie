"use client";

import { useEffect, useState } from "react";

interface FloatingCourrier {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export default function CourrierAnimations() {
  const [courriers, setCourriers] = useState<FloatingCourrier[]>([]);

  useEffect(() => {
    // Créer des courriers flottants
    const newCourriers: FloatingCourrier[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    }));
    setCourriers(newCourriers);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {courriers.map((courrier) => (
        <div
          key={courrier.id}
          className="absolute text-3xl opacity-[0.02]"
          style={{
            left: `${courrier.x}%`,
            top: `${courrier.y}%`,
            animation: `floatCourrier ${courrier.duration}s ease-in-out infinite`,
            animationDelay: `${courrier.delay}s`,
          }}
        >
          📨
        </div>
      ))}

      {/* Lignes de courrier animées */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0033A0" stopOpacity="0" />
            <stop offset="50%" stopColor="#0033A0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0033A0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(3)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={`${30 + i * 25}%`}
            x2="100%"
            y2={`${30 + i * 25}%`}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            className="animate-drawLine"
            style={{
              animationDelay: `${i * 2}s`,
              animationDuration: `${20 + i * 5}s`,
            }}
          />
        ))}
      </svg>

      <style jsx>{`
        @keyframes floatCourrier {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -30px) rotate(10deg);
          }
          50% {
            transform: translate(-15px, -20px) rotate(-10deg);
          }
          75% {
            transform: translate(10px, -25px) rotate(5deg);
          }
        }

        @keyframes drawLine {
          0% {
            stroke-dasharray: 0 1000;
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            stroke-dasharray: 1000 0;
            opacity: 0;
          }
        }

        .animate-drawLine {
          animation: drawLine linear infinite;
        }
      `}</style>
    </div>
  );
}

