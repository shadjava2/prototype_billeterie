"use client";

import { useEffect, useState } from "react";

interface FloatingIcon {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  icon: string;
  rotation: number;
}

export default function CourrierWhatsAppBackground() {
  const [icons, setIcons] = useState<FloatingIcon[]>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; duration: number; delay: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Icônes courrier variées et belles
    const iconList = [
      "📨", "📧", "📬", "✉️", "📮", "📭", "📫", "📪",
      "📥", "📤", "📋", "📄", "📃", "📑", "📊", "📈"
    ];

    const newIcons: FloatingIcon[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 20,
      size: 28 + Math.random() * 20,
      icon: iconList[Math.floor(Math.random() * iconList.length)],
      rotation: Math.random() * 360,
    }));
    setIcons(newIcons);

    // Créer les particules flottantes
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Fond style WhatsApp - vert clair avec dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e5ddd5] via-[#d4c5b9] to-[#e5ddd5]"></div>

      {/* Overlay subtil pour plus de profondeur */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#e5ddd5]/30"></div>

      {/* Motif de fond subtil style WhatsApp */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Icônes courrier flottantes - style WhatsApp mais avec icônes courrier */}
      <div className="absolute inset-0">
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="absolute opacity-[0.12] select-none"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              fontSize: `${icon.size}px`,
              animation: `courrierFloat ${icon.duration}s ease-in-out infinite`,
              animationDelay: `${icon.delay}s`,
              transform: `rotate(${icon.rotation}deg)`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          >
            {icon.icon}
          </div>
        ))}
      </div>

      {/* Lignes de connexion subtiles */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="whatsappLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={`${10 + i * 12}%`}
            x2="100%"
            y2={`${10 + i * 12}%`}
            stroke="url(#whatsappLineGradient)"
            strokeWidth="1"
            className="animate-drawLine"
            style={{
              animationDelay: `${i * 2}s`,
              animationDuration: `${20 + i * 3}s`,
            }}
          />
        ))}
      </svg>

      {/* Particules flottantes */}
      {mounted && (
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#000000] opacity-[0.06]"
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
        @keyframes courrierFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.12;
          }
          25% {
            transform: translate(40px, -50px) rotate(20deg) scale(1.15);
            opacity: 0.18;
          }
          50% {
            transform: translate(-30px, -40px) rotate(-15deg) scale(0.95);
            opacity: 0.12;
          }
          75% {
            transform: translate(30px, -45px) rotate(10deg) scale(1.08);
            opacity: 0.15;
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
            opacity: 0.06;
          }
          50% {
            transform: translate(50px, -50px) scale(1.8);
            opacity: 0.1;
          }
        }

        .animate-drawLine {
          animation: drawLine linear infinite;
        }
      `}</style>
    </div>
  );
}

