
// --- WHITE LABEL CONFIGURATION ---
// Modifica questo file per personalizzare l'app per ogni cliente prima del deployment.

export const APP_CONFIG = {
  // Brand Identity
  appName: "Luminel",
  tagline: "Gestionale Premium per Professionisti",

  // SEO / Browser Title
  documentTitle: "Luminel | Gestionale Premium",

  // Default Settings
  currency: "EUR (€)",
  timezone: "Europe/Rome",
  locale: "it-IT",

  // Theme Colors (Per future implementazioni CSS dinamiche)
  primaryColor: "#ce9341", // Gold

  // Splash Screen Quotes & Images (Puoi personalizzarle per parrucchieri, coach, ecc.)
  // Le immagini devono essere URL ad alta risoluzione (Unsplash, Pexels, etc.)
  splashQuotes: [
    {
      text: "La bellezza inizia nel momento in cui decidi di essere te stesso.",
      author: "Coco Chanel",
      image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop" // Woman/Light vibe
    },
    {
      text: "Investi in te stesso, è l'unico investimento che non fallisce mai.",
      author: "Anonimo",
      image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop" // Nature/Sunrise vibe
    },
    {
      text: "La qualità non è mai un incidente; è sempre il risultato di uno sforzo intelligente.",
      author: "John Ruskin",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" // Minimal/Architecture vibe
    },
    {
      text: "Il successo è la somma di piccoli sforzi, ripetuti giorno dopo giorno.",
      author: "Robert Collier",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop" // Ocean/Calm vibe
    }
  ],

  // Default User (Initial Admin)
  defaultAdmin: {
    name: "Admin User",
    email: "admin@portal.com",
    role: "Manager",
    avatar: "https://ui-avatars.com/api/?name=Admin&background=1c1917&color=fff"
  },

  // Ecosistema, WhatsApp & Calendario
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || "jaramichael@hotmail.com",
  whatsappNumber: "393478901234", // Esempio numero configurato
  calendarUrl: "https://calendar.google.com/calendar/appointments/schedules/YOUR_GOOGLE_SCHEDULE",
  founderDeadline: "2026-12-31T23:59:59"
};

