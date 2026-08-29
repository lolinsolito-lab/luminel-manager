import { LucideIcon, Star, Zap, Crown, Building2 } from 'lucide-react';

export interface TierPlan {
  id: string;
  name: string;
  tagline: string;
  whoFor: string;
  solves: string;
  priceFounderMonthly: number;
  priceFounderAnnual: number;
  pricePublic: number;
  features: string[];
  edge?: string;
  popular: boolean;
  // Campi visivi — statici, non vengono dal DB (che non ha colonne per questo)
  icon: LucideIcon;
  color: string;        // gradient Tailwind, es. 'from-stone-500 to-stone-700'
  borderColor: string;  // classe bordo Tailwind
  badge?: string;       // es. 'Più Scelto 🔥'
  // Limiti — numeri grezzi (-1 = illimitato), coerenti con subscription_plans nel DB.
  // Ogni pagina li formatta a modo suo (stringa "50 clienti" vs oggetto separato):
  // format qui, non nel dato, per non imporre una UI all'altra.
  maxUsers: number;
  maxClients: number;
  maxSessions: number;
  maxLocations: number;
}

export const STATIC_PRICING_PLANS: TierPlan[] = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Il punto di partenza.',
    whoFor: 'Per chi lavora solo e sta uscendo da Excel e WhatsApp.',
    solves: 'La fase in cui il caos comincia a costare tempo vero, ma non hai ancora bisogno di un team.',
    priceFounderMonthly: 33,
    priceFounderAnnual: 330,
    pricePublic: 59,
    features: ['Dashboard KPI in tempo reale', 'Calendario anti-overbooking', 'CRM fino a 50 clienti', 'AI Coach Base'],
    edge: 'Excel non ti avvisa mai di un doppio appuntamento. Qui è impossibile per costruzione.',
    popular: false,
    icon: Star,
    color: 'from-stone-500 to-stone-700',
    borderColor: 'border-stone-500/20 hover:border-stone-500/40',
    badge: 'Base',
    maxUsers: 1,
    maxClients: 50,
    maxSessions: 100,
    maxLocations: 1,
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Automazione intelligente.',
    whoFor: 'Per chi ha superato i 50 clienti e i promemoria manuali non reggono più.',
    solves: 'Le ore perse ogni settimana a scrivere fatture e ricordare appuntamenti uno per uno.',
    priceFounderMonthly: 55,
    priceFounderAnnual: 550,
    pricePublic: 99,
    features: ['5 utenti/collaboratori', 'Promemoria WhatsApp automatici', 'Fatturazione con export PDF', 'AI Coach Pro (suggerimenti proattivi)'],
    edge: 'Zero commissioni sui clienti che porti tu — a differenza di chi ti fa pagare per ogni nuovo cliente dal marketplace.',
    popular: true,
    icon: Zap,
    color: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/30 hover:border-amber-500/50',
    badge: 'Più Scelto 🔥',
    maxUsers: 5,
    maxClients: 250,
    maxSessions: 500,
    maxLocations: 1,
  },
  {
    id: 'signature',
    name: 'SIGNATURE',
    tagline: "L'esperienza White-Label.",
    whoFor: 'Per chi vuole essere percepito come uno studio, non un solopreneur.',
    solves: "L'assenza di un programma fedeltà vero e di dati sul rendimento del team.",
    priceFounderMonthly: 88,
    priceFounderAnnual: 880,
    pricePublic: 159,
    features: ['10 utenti/collaboratori', 'White-Label (il tuo brand, non il nostro)', 'Loyalty Engine per i clienti fedeli', 'Team Analytics'],
    edge: 'Il tuo logo, i tuoi colori, la tua identità — i clienti vedono te, non Luminel.',
    popular: false,
    icon: Crown,
    color: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-500/30 hover:border-orange-500/50',
    badge: 'Consigliato',
    maxUsers: 10,
    maxClients: 500,
    maxSessions: -1,
    maxLocations: 2,
  },
  {
    id: 'empire',
    name: 'EMPIRE',
    tagline: 'Oltre ogni limite.',
    whoFor: 'Per chi scala su più sedi o team ampi e non vuole limiti tecnici.',
    solves: "La necessità di integrazioni su misura e di un supporto che non sia un ticket #48291.",
    priceFounderMonthly: 138,
    priceFounderAnnual: 1380,
    pricePublic: 249,
    features: ['Utenti e sedi illimitati', 'API complete', 'Success Manager dedicato', 'Onboarding VIP con Michael'],
    edge: 'Non un numero di ticket. Una persona vera che risponde, come nel resto di Luminel.',
    popular: false,
    icon: Building2,
    color: 'from-violet-600 to-purple-700',
    borderColor: 'border-violet-500/30 hover:border-violet-500/50',
    badge: 'Esclusivo 👑',
    maxUsers: -1,
    maxClients: -1,
    maxSessions: -1,
    maxLocations: -1,
  },
];

/**
 * Sconto reale, calcolato dai prezzi effettivi — mai un numero fisso
 * scritto a mano che potrebbe disallinearsi se cambi un prezzo.
 */
export const getDiscountPercent = (plan: TierPlan): number => {
  if (!plan.pricePublic) return 0;
  return Math.round((1 - plan.priceFounderMonthly / plan.pricePublic) * 100);
};

/**
 * FIX (28 ago 2026): il matching precedente confrontava p.id (UUID nel DB)
 * con staticPlan.id (stringa 'starter'/'pro'/...) — non trovava MAI corrispondenza.
 * La colonna che contiene 'starter'/'pro'/'signature'/'empire' nel DB è `name`,
 * non `id`. Corretto qui sotto.
 *
 * NOTA D'USO IMPORTANTE: questa funzione ritorna STATIC_PRICING_PLANS se
 * dbPlans è null/vuoto — comodo come default generico, ma NON va usata così
 * nelle pagine pubbliche (FounderLanding/HomeLanding). Lì, se il fetch dal
 * DB fallisce, la UI deve mostrare uno stato di errore esplicito — mai un
 * fallback silenzioso su prezzi potenzialmente vecchi. Chiamare questa
 * funzione SOLO dopo aver verificato che dbPlans è valido e non vuoto.
 */
export const getMergedPricingPlans = (dbPlans: any[] | null): TierPlan[] => {
  if (!dbPlans || dbPlans.length === 0) return STATIC_PRICING_PLANS;

  return STATIC_PRICING_PLANS.map(staticPlan => {
    const dbPlan = dbPlans.find(p => p.name === staticPlan.id);

    if (dbPlan) {
      return {
        ...staticPlan,
        pricePublic: Number(dbPlan.price_monthly_public) || staticPlan.pricePublic,
        priceFounderMonthly: Number(dbPlan.price_monthly_founder) || staticPlan.priceFounderMonthly,
        priceFounderAnnual: Number(dbPlan.price_annual_founder) || staticPlan.priceFounderAnnual,
        maxUsers: dbPlan.max_users ?? staticPlan.maxUsers,
        maxClients: dbPlan.max_clients ?? staticPlan.maxClients,
        maxSessions: dbPlan.max_sessions_per_month ?? staticPlan.maxSessions,
        maxLocations: dbPlan.max_locations ?? staticPlan.maxLocations,
      };
    }
    return staticPlan;
  });
};