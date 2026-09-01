import React from "react";
import { 
  ArrowRight, 
  Target, 
  Crown, 
  Star,
  Activity,
  Heart,
  Brain,
  Dumbbell,
  Scissors,
  Sparkles
} from "lucide-react";

// --- TARGET AUDIENCE (Marquee) ---
const CLIENTS = [
  { name: "Coach & Mentori", icon: Brain },
  { name: "Personal Trainer", icon: Dumbbell },
  { name: "Operatori Olistici", icon: Sparkles },
  { name: "Centri Estetici", icon: Scissors },
  { name: "Psicologi", icon: Heart },
  { name: "Studi Tattoo", icon: Target },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium sm:text-xs">{label}</span>
  </div>
);

export function GlassmorphismTrustHero() {
  return (
    <div className="relative w-full bg-transparent text-white overflow-hidden font-sans border-t border-white/5 py-16">
      {/* SCOPED ANIMATIONS */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Sfondo Astratto/Vetro */}
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,185,150,0.08) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">
            
            {/* Badge */}
            <div className="animate-fade-in delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,185,150,0.2)] bg-white/5 px-4 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b996] flex items-center gap-2">
                  La Scienza dell'Efficienza
                  <Star className="w-3.5 h-3.5 text-[#c8b996] fill-[#c8b996]" />
                </span>
              </div>
            </div>

            {/* Heading */}
            <h2 
              className="animate-fade-in delay-200 font-serif text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1]"
            >
              I numeri <br />
              <span className="bg-gradient-to-r from-white via-white to-[#c8b996] bg-clip-text text-transparent italic pr-2">
                non mentono.
              </span><br />
              Il tuo business decolla.
            </h2>

            {/* Description */}
            <p className="animate-fade-in delay-300 max-w-xl text-lg text-[#a8a29e] leading-relaxed font-light">
              Luminel Manager elimina gli errori manuali e automatizza le operazioni di back-office, permettendoti di scalare il tuo studio e recuperare il controllo totale.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in delay-400 flex flex-col sm:flex-row gap-4">
              <a href="#pricing" className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c8b996] to-[#f0d080] px-8 py-4 text-[0.85rem] uppercase tracking-widest font-bold text-[#050504] transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(200,185,150,0.2)] active:scale-[0.98]">
                Inizia Subito
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              
              <a href="#soluzioni" className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-[0.85rem] uppercase tracking-widest font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-[#c8b996]/50">
                Esplora Soluzioni
              </a>
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">
            
            {/* Stats Card */}
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(5,5,4,0.6)] p-8 backdrop-blur-xl shadow-2xl">
              {/* Card Glow Effect */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#c8b996]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c8b996]/10 ring-1 ring-[#c8b996]/30">
                    <Crown className="h-6 w-6 text-[#c8b996]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">150+</div>
                    <div className="text-sm text-[#a8a29e]">Professionisti Attivi</div>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a8a29e]">Tasso di Adozione Totale</span>
                    <span className="text-white font-medium">94%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-white to-[#c8b996]" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                {/* Mini Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="-78%" label="Errori" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="24/7" label="Automazione" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="+3.2h" label="Risparmiate" />
                </div>

                {/* Tag Pills */}
                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c8b996]/20 bg-[#c8b996]/10 px-3 py-1 text-[10px] font-medium tracking-wide text-[#c8b996]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8b996] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f0d080]"></span>
                    </span>
                    SISTEMA OPERATIVO
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-stone-300">
                    <Activity className="w-3 h-3 text-stone-400" />
                    ANTI-OVERBOOKING
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee Card */}
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(5,5,4,0.6)] py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-xs font-medium text-stone-400 uppercase tracking-widest">Sviluppato per chi guida persone</h3>
              
              <div 
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {/* Triple list for seamless loop */}
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 opacity-50 transition-all hover:opacity-100 hover:scale-105 cursor-default grayscale hover:grayscale-0"
                    >
                      <client.icon className="h-5 w-5 text-white" />
                      <span className="text-sm font-semibold text-white tracking-wide">
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
