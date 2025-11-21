"use client";

import { useEffect, useState } from "react";

interface FloatingEnvelope {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

export default function AnimatedEnvelopeBackground() {
  const [envelopes, setEnvelopes] = useState<FloatingEnvelope[]>([]);
  const [icons, setIcons] = useState<Array<{ id: number; x: number; y: number; icon: string; delay: number; duration: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; duration: number; delay: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Créer des enveloppes flottantes
    const newEnvelopes: FloatingEnvelope[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 15,
      size: 30 + Math.random() * 20,
      rotation: Math.random() * 360,
    }));
    setEnvelopes(newEnvelopes);

    // Créer des icônes animées style WhatsApp mais pro
    const iconList = ["📨", "📧", "📬", "✉️", "📮", "📭", "📫", "📪"];
    const newIcons = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: iconList[Math.floor(Math.random() * iconList.length)],
      delay: Math.random() * 8,
      duration: 15 + Math.random() * 10,
    }));
    setIcons(newIcons);

    // Créer les particules de connexion
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 12 + Math.random() * 8,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient de fond professionnel */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/20"></div>

      {/* Motif de fond subtil */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            #0033A0 10px,
            #0033A0 20px
          )`,
        }}
      ></div>

      {/* Enveloppes flottantes animées - style professionnel */}
      <div className="absolute inset-0">
        {envelopes.map((envelope) => (
          <div
            key={envelope.id}
            className="absolute opacity-[0.025] filter blur-[0.5px]"
            style={{
              left: `${envelope.x}%`,
              top: `${envelope.y}%`,
              fontSize: `${envelope.size}px`,
              animation: `envelopeFloat ${envelope.duration}s ease-in-out infinite`,
              animationDelay: `${envelope.delay}s`,
              transform: `rotate(${envelope.rotation}deg)`,
            }}
          >
            📨
          </div>
        ))}
      </div>

      {/* Icônes animées style WhatsApp mais professionnel */}
      <div className="absolute inset-0">
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="absolute opacity-[0.02] filter blur-[0.3px]"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              fontSize: "20px",
              animation: `iconFloat ${icon.duration}s ease-in-out infinite`,
              animationDelay: `${icon.delay}s`,
            }}
          >
            {icon.icon}
          </div>
        ))}
      </div>

      {/* Lignes de connexion animées (style réseau professionnel) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0033A0" stopOpacity="0" />
            <stop offset="50%" stopColor="#0033A0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0033A0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={`${20 + i * 20}%`}
            x2="100%"
            y2={`${20 + i * 20}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            className="animate-drawLine"
            style={{
              animationDelay: `${i * 3}s`,
              animationDuration: `${25 + i * 5}s`,
            }}
          />
        ))}
      </svg>

      {/* Particules de connexion */}
      {mounted && (
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full bg-[#0033A0] opacity-[0.05]"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes envelopeFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.025;
          }
          25% {
            transform: translate(30px, -40px) rotate(15deg);
            opacity: 0.035;
          }
          50% {
            transform: translate(-20px, -30px) rotate(-10deg);
            opacity: 0.025;
          }
          75% {
            transform: translate(20px, -35px) rotate(8deg);
            opacity: 0.03;
          }
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.03;
          }
          33% {
            transform: translate(25px, -30px) scale(1.1);
            opacity: 0.04;
          }
          66% {
            transform: translate(-15px, -20px) scale(0.9);
            opacity: 0.03;
          }
        }

        @keyframes drawLine {
          0% {
            stroke-dasharray: 0 1000;
            opacity: 0;
          }
          10% {
            opacity: 0.02;
          }
          90% {
            opacity: 0.02;
          }
          100% {
            stroke-dasharray: 1000 0;
            opacity: 0;
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.05;
          }
          50% {
            transform: translate(40px, -40px) scale(1.5);
            opacity: 0.08;
          }
        }

        .animate-drawLine {
          animation: drawLine linear infinite;
        }
      `}</style>
    </div>
  );
}

