const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// 1. Add Check to lucide imports
content = content.replace(
  'Brain, Lock, ArrowRight, ArrowUpRight, Activity, Sparkles, Flame, Clock',
  'Brain, Lock, ArrowRight, ArrowUpRight, Activity, Sparkles, Flame, Clock, Check'
);

// 2. Replace PRICING_PLANS with enriched version
const oldPricing = `const PRICING_PLANS = [
  { id: 'starter', name: 'STARTER', tagline: 'Il punto di partenza.', priceFounder: 33, pricePublic: 59, features: ['Real-time KPI', 'Smart Calendar', 'CRM (50 clienti)', 'AI Coach Base'], popular: false },
  { id: 'pro', name: 'PRO', tagline: 'Automazione intelligente.', priceFounder: 55, pricePublic: 99, features: ['5 Utenti', 'WhatsApp Auto', 'Fatturazione', 'AI Coach Pro'], popular: true },
  { id: 'signature', name: 'SIGNATURE', tagline: \"L'esperienza White-Label.\", priceFounder: 88, pricePublic: 159, features: ['10 Utenti', 'White Label', 'Loyalty Engine', 'Team Analytics'], popular: false },
  { id: 'empire', name: 'EMPIRE', tagline: 'Oltre ogni limite.', priceFounder: 138, pricePublic: 249, features: ['Illimitato', 'API Complete', 'Success Manager', 'Onboarding VIP'], popular: false },
];`;

const newPricing = `interface TierPlan {
  id: string;
  name: string;
  tagline: string;
  whoFor: string;
  solves: string;
  priceFounder: number;
  pricePublic: number;
  features: string[];
  edge?: string;
  popular: boolean;
}

const PRICING_PLANS: TierPlan[] = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Il punto di partenza.',
    whoFor: 'Per chi lavora solo e sta uscendo da Excel e WhatsApp.',
    solves: 'La fase in cui il caos comincia a costare tempo vero, ma non hai ancora bisogno di un team.',
    priceFounder: 33,
    pricePublic: 59,
    features: ['Dashboard KPI in tempo reale', 'Calendario anti-overbooking', 'CRM fino a 50 clienti', 'AI Coach Base'],
    edge: 'Excel non ti avvisa mai di un doppio appuntamento. Qui è impossibile per costruzione.',
    popular: false,
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Automazione intelligente.',
    whoFor: 'Per chi ha superato i 50 clienti e i promemoria manuali non reggono più.',
    solves: 'Le ore perse ogni settimana a scrivere fatture e ricordare appuntamenti uno per uno.',
    priceFounder: 55,
    pricePublic: 99,
    features: ['5 utenti/collaboratori', 'Promemoria WhatsApp automatici', 'Fatturazione con export PDF', 'AI Coach Pro (suggerimenti proattivi)'],
    edge: 'Zero commissioni sui clienti che porti tu — a differenza di chi ti fa pagare per ogni nuovo cliente dal marketplace.',
    popular: true,
  },
  {
    id: 'signature',
    name: 'SIGNATURE',
    tagline: "L'esperienza White-Label.",
    whoFor: 'Per chi vuole essere percepito come uno studio, non un solopreneur.',
    solves: "L'assenza di un programma fedeltà vero e di dati sul rendimento del team.",
    priceFounder: 88,
    pricePublic: 159,
    features: ['10 utenti/collaboratori', 'White-Label (il tuo brand, non il nostro)', 'Loyalty Engine per i clienti fedeli', 'Team Analytics'],
    edge: 'Il tuo logo, i tuoi colori, la tua identità — i clienti vedono te, non Luminel.',
    popular: false,
  },
  {
    id: 'empire',
    name: 'EMPIRE',
    tagline: 'Oltre ogni limite.',
    whoFor: 'Per chi scala su più sedi o team ampi e non vuole limiti tecnici.',
    solves: "La necessità di integrazioni su misura e di un supporto che non sia un ticket #48291.",
    priceFounder: 138,
    pricePublic: 249,
    features: ['Utenti e sedi illimitati', 'API complete', 'Success Manager dedicato', 'Onboarding VIP con Michael'],
    edge: 'Non un numero di ticket. Una persona vera che risponde, come nel resto di Luminel.',
    popular: false,
  },
];`;

if (content.includes(oldPricing)) {
  content = content.replace(oldPricing, newPricing);
  console.log('PRICING_PLANS replaced');
} else {
  console.log('WARNING: exact PRICING_PLANS match not found, searching for partial...');
  const idx = content.indexOf("const PRICING_PLANS = [");
  const end = content.indexOf("];", idx) + 2;
  console.log('Found at:', idx, 'to', end);
  console.log(content.substring(idx, Math.min(idx+200, end)));
}

// 3. Add PricingSection component just before the LandingV2 export
const pricingComponent = `
// --- SEZIONE: Pricing arricchito ----------------------------------------------
const PricingSection: React.FC = () => (
  <section id="pricing" style={{ padding: '8rem 1.5rem', maxWidth: '76rem', margin: '0 auto', position: 'relative', zIndex: 20, borderTop: borderLine }}>
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100vw', height: 400, background: 'radial-gradient(ellipse, rgba(200,185,150,0.04) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

    <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.5rem,5vw,5rem)', color: '#fff', fontWeight: 300, marginBottom: '1.5rem' }}>Scegli la tua soluzione.</h2>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '9999px', border: '1px solid rgba(160,148,120,0.4)', background: 'rgba(240,232,210,0.03)', backdropFilter: 'blur(12px)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(200,185,150,0.7)' }}>
        Prezzi Founder Bloccati a Vita
      </div>
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem 2.5rem', marginBottom: '4rem', padding: '1.5rem', borderRadius: '1rem', border: borderLine, background: 'rgba(240,232,210,0.015)' }}>
      {[
        'Zero commissioni sui tuoi clienti, mai',
        'AI Coach col contesto del tuo business reale',
        'Verificato riga per riga, non solo promesso',
      ].map((point, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#a8a29e' }}>
          <Check size={14} color="rgba(240,232,210,1)" />
          {point}
        </div>
      ))}
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
      {PRICING_PLANS.map((plan, idx) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: idx * 0.08 }}
          style={{
            position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            padding: '2rem 2.5rem', borderRadius: '1.25rem',
            border: plan.popular ? '1px solid rgba(240,232,210,0.2)' : borderLine,
            background: plan.popular ? 'linear-gradient(110deg,rgba(240,232,210,0.05) 0%,rgba(5,5,4,0.9) 100%)' : 'rgba(240,232,210,0.01)',
            backdropFilter: 'blur(20px)', overflow: 'hidden',
          }}
        >
          {plan.popular && <div style={{ position: 'absolute', top: 0, right: 0, width: 260, height: 260, background: 'radial-gradient(circle,rgba(240,232,210,0.07) 0%,transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />}

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', position: 'relative', zIndex: 1 }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.4rem,2vw,1.9rem)', color: '#fff', fontWeight: 300, margin: 0 }}>{plan.name}</h3>
                {plan.popular && <span style={{ padding: '0.18rem 0.7rem', borderRadius: '9999px', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#050504', background: '#fff' }}>Raccomandato</span>}
              </div>
              <p style={{ color: '#44403c', fontWeight: 300, fontSize: '0.82rem', marginBottom: '0.9rem' }}>{plan.tagline}</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(200,185,150,0.7)', fontWeight: 500, marginBottom: '0.4rem' }}>{plan.whoFor}</p>
              <p style={{ fontSize: '0.82rem', color: '#78716c', lineHeight: 1.6, marginBottom: '1rem', maxWidth: '30rem' }}>Risolve: {plan.solves}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.4rem', marginBottom: plan.edge ? '1rem' : 0 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#a8a29e', fontWeight: 300 }}>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(160,148,120,0.4)' }} />{f}
                  </div>
                ))}
              </div>
              {plan.edge && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(240,232,210,0.65)', fontStyle: 'italic', borderLeft: '2px solid rgba(160,148,120,0.4)', paddingLeft: '0.85rem', maxWidth: '30rem' }}>
                  {plan.edge}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, borderLeft: borderLine, paddingLeft: '2.25rem' }}>
              <div style={{ fontSize: '0.6rem', color: '#2d2b28', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>invece di EUR{plan.pricePublic}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1.1rem' }}>
                <span style={{ color: '#44403c', fontSize: '1.1rem' }}>EUR</span>
                <span style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.2rem,3.2vw,3.2rem)', color: '#fff', fontWeight: 300, lineHeight: 1 }}>{plan.priceFounder}</span>
                <span style={{ color: '#44403c', fontSize: '0.8rem' }}>/mo</span>
              </div>
              <Link to={"/auth/register?plan=" + plan.id}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.6rem', borderRadius: '9999px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', textDecoration: 'none', fontWeight: plan.popular ? 700 : 400, background: plan.popular ? '#fff' : 'transparent', color: plan.popular ? '#050504' : 'rgba(160,148,120,0.4)', border: plan.popular ? 'none' : '1px solid rgba(240,232,210,0.12)', whiteSpace: 'nowrap' }}>
                Scegli {plan.name} <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

`;

content = content.replace(
  'export const LandingV2: React.FC = () => {',
  pricingComponent + 'export const LandingV2: React.FC = () => {'
);

// 4. Find and replace the old pricing section in JSX with <PricingSection />
// The old section starts with {/* and has id="pricing"
const oldSection = /\{\/\*.*?PRICING.*?\*\/\}\s*\n\s*<section id="pricing"[\s\S]+?<\/section>/;
const match = content.match(oldSection);
if (match) {
  content = content.replace(oldSection, '<PricingSection />');
  console.log('Pricing section replaced in JSX');
} else {
  // try simpler
  const idx2 = content.lastIndexOf('<section id="pricing"');
  if (idx2 !== -1) {
    const endTag = '</section>';
    let depth = 0;
    let i = idx2;
    let replaced = false;
    // find the matching closing tag
    while (i < content.length - endTag.length) {
      if (content.substring(i, i + 8) === '<section') depth++;
      if (content.substring(i, i + endTag.length) === endTag) {
        depth--;
        if (depth === 0) {
          const before = content.substring(0, idx2);
          const after = content.substring(i + endTag.length);
          content = before + '<PricingSection />' + after;
          console.log('Pricing section replaced (fallback method)');
          replaced = true;
          break;
        }
      }
      i++;
    }
    if (!replaced) console.log('ERROR: could not find end of pricing section');
  } else {
    console.log('ERROR: pricing section not found');
  }
}

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('DONE');
