"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient animé subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#0033A0]/5 to-transparent animate-gradient-shift"></div>

      {/* Lignes animées subtiles */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#0033A0]/10 to-transparent"
            style={{
              top: `${20 + i * 20}%`,
              animation: `slideLine ${15 + i * 2}s linear infinite`,
              animationDelay: `${i * 2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Courriers flottants animés - plus subtils */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-[0.03]"
            style={{
              left: `${15 + i * 15}%`,
              top: `${25 + (i % 3) * 30}%`,
              animation: `floatCourrier ${25 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
            }}
          >
            <div className="text-5xl">📨</div>
          </div>
        ))}
      </div>

      {/* Particules animées */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#0033A0]/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${10 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Style pour les animations */}
      <style jsx>{`
        @keyframes slideLine {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }

        @keyframes floatCourrier {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-20px) rotate(5deg) scale(1.1);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-10px) rotate(-5deg) scale(0.9);
            opacity: 0.1;
          }
          75% {
            transform: translateY(-15px) rotate(3deg) scale(1.05);
            opacity: 0.12;
          }
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(30px, -30px) scale(1.5);
            opacity: 0.4;
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>
    </div>
  );
}

