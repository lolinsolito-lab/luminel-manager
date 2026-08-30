"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Bot } from "lucide-react";

const COLORS = {
  accent: "#c8b996",
  accentHover: "#e0d1af",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  overlay: "rgba(5, 5, 4, 0.55)", // Mix of black with slight gold tint, reduced opacity for robots
};

export function AiCoachHeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050504]">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          {/* Original Robot Video from Claude-Mem */}
          <source src="https://claude-mem.ai/video/hero-bg.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: COLORS.overlay }}
        />
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050504]/50 to-[#050504]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={22} color={COLORS.accent} />
            <span className="font-semibold text-xl tracking-wider" style={{ color: COLORS.accent }}>Luminel Manager</span>
          </div>
          <span
            className="text-[0.65rem] font-bold uppercase tracking-[0.2em]"
            style={{ color: COLORS.accent }}
          >
            L'AI CHE RISOLVE I PROBLEMI DI COACH E OPERATORI OLISTICI
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="mb-6 max-w-5xl font-serif text-4xl font-light leading-[1.1] text-white md:text-6xl lg:text-7xl">
            <span className="block">Smetti di rincorrere i dati.</span>
            <span
              className="block mt-2 italic"
              style={{
                color: COLORS.accent,
                textShadow: `0 0 50px ${COLORS.accent}50`
              }}
            >
              Inizia a dominare il business.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-10 max-w-2xl text-lg text-stone-400 font-light leading-relaxed"
        >
          Luminel AI non è un semplice chatbot. È il tuo socio invisibile che fissa appuntamenti, risponde ai clienti e ti suggerisce le strategie perfette per aumentare il fatturato. <strong className="text-white font-medium">Mentre tu dormi.</strong>
        </motion.p>

        {/* AI Action Command (Terminal Style) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-10 w-full max-w-2xl"
        >
          <div className="mb-3 text-[0.7rem] uppercase tracking-widest text-white/30 font-bold">Interazione Live:</div>
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-[#c8b996]/10 bg-black/40 px-5 py-4 font-mono text-sm backdrop-blur-md shadow-2xl">
            <span className="text-stone-400">Cliente:</span>
            <code className="text-white">"Vorrei prenotare per domani mattina"</code>
            <span className="text-[#c8b996] animate-pulse">&&</span>
            <span className="text-[#c8b996]"><Bot size={16} /></span>
            <code className="text-[#c8b996]">"Certamente. Ti propongo le 10:00 o le 11:30. Quale preferisci?"</code>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/founder"
            className="flex items-center gap-3 rounded-full px-8 py-4 font-bold text-black uppercase tracking-[0.1em] text-[0.85rem] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(200,185,150,0.4)]"
            style={{ background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentHover})` }}
          >
            <Sparkles size={16} />
            <span>Diventa Founder</span>
          </Link>
          <a
            href="#storia"
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold uppercase tracking-[0.1em] text-[0.85rem] text-white backdrop-blur-sm transition-all hover:bg-white/10"
          >
            <span>Scopri come funziona</span>
            <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-8 flex flex-col items-center gap-3"
        >
          <span className="text-[0.65rem] uppercase tracking-widest text-white/30 font-bold">Scorri per scoprire</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="h-5 w-5 text-white/30 rotate-90" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
