const fs = require('fs');

let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// 1. Update imports
content = content.replace(
  'Brain, Lock, ArrowRight, ArrowUpRight, Activity, Sparkles',
  'Brain, Lock, ArrowRight, ArrowUpRight, Activity, Sparkles, Flame, Clock'
);

// 2. Add components before LandingV2
const newComponents = `
// --- SEZIONE: Categorie Professionali -----------------------------------------
const PROFESSIONAL_CATEGORIES = [
  {
    id: 'coach',
    name: 'Coach',
    status: 'live',
    fomo: '12 posti Founder rimasti su questa categoria',
    desc: 'Sessioni, obiettivi, no-show, LTV cliente — il linguaggio che i CRM generici non parlano.',
  },
  {
    id: 'olistici',
    name: 'Operatori Olistici',
    status: 'live',
    fomo: '9 posti Founder rimasti su questa categoria',
    desc: 'Massaggiatori, naturopati, operatori del benessere — rituali e appuntamenti su misura.',
  },
  {
    id: 'saloni',
    name: 'Saloni & Estetiste',
    status: 'soon',
    fomo: 'Lista d\\'attesa aperta',
    desc: 'In arrivo con fatturazione elettronica italiana integrata.',
  },
  {
    id: 'tattoo',
    name: 'Tatuatori',
    status: 'soon',
    fomo: 'Lista d\\'attesa aperta',
    desc: 'In arrivo nella prossima fase di espansione.',
  },
];

const CategoriesSection: React.FC = () => {
  const [joinedWaitlist, setJoinedWaitlist] = useState<string[]>([]);

  return (
    <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '7rem 1.5rem', borderTop: '1px solid rgba(240,232,210,0.07)' }}>
      <div style={{ textAlign: 'center', maxWidth: '46rem', margin: '0 auto 4rem' }}>
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(200,185,150,0.7)', display: 'block', marginBottom: '1.25rem' }}>Per Chi È Luminel</span>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,3.5vw,3.2rem)', color: '#fff', fontWeight: 300, lineHeight: 1.25 }}>
          Costruito per chi vive di sessioni,<br />non di scontrini.
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem' }}>
        {PROFESSIONAL_CATEGORIES.map((cat, idx) => {
          const isLive = cat.status === 'live';
          const hasJoined = joinedWaitlist.includes(cat.id);

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              whileHover={isLive ? { y: -4 } : {}}
              style={{
                position: 'relative',
                padding: '2rem 1.75rem',
                borderRadius: '1.25rem',
                border: isLive ? '1px solid rgba(240,232,210,0.28)' : '1px solid rgba(240,232,210,0.06)',
                background: isLive
                  ? 'linear-gradient(160deg, rgba(240,232,210,0.06), rgba(5,5,4,0.6))'
                  : 'rgba(240,232,210,0.015)',
                opacity: isLive ? 1 : 0.7,
                overflow: 'hidden',
              }}
            >
              {isLive && (
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,232,210,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}
                />
              )}

              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem',
                background: isLive ? 'rgba(240,232,210,0.15)' : 'rgba(240,232,210,0.04)',
                color: isLive ? 'rgba(240,232,210,1)' : 'rgba(160,148,120,0.6)' }}>
                {isLive ? (
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                ) : (
                  <Clock size={10} />
                )}
                {isLive ? 'Attivo Ora' : 'Coming Soon'}
              </div>

              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.4rem', color: '#fff', fontWeight: 300, marginBottom: '0.65rem' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#78716c', lineHeight: 1.6, marginBottom: '1.25rem', minHeight: '3.2em' }}>{cat.desc}</p>

              {isLive ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#F0A868', fontWeight: 600, borderTop: '1px solid rgba(240,232,210,0.08)', paddingTop: '1rem' }}>
                  <Flame size={13} />
                  {cat.fomo}
                </div>
              ) : (
                <button
                  onClick={() => setJoinedWaitlist(prev => [...prev, cat.id])}
                  disabled={hasJoined}
                  style={{
                    width: '100%', padding: '0.65rem', borderRadius: '0.65rem', fontSize: '0.72rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: hasJoined ? 'default' : 'pointer',
                    background: hasJoined ? 'rgba(111,207,151,0.1)' : 'rgba(240,232,210,0.05)',
                    border: hasJoined ? '1px solid rgba(111,207,151,0.3)' : '1px solid rgba(240,232,210,0.12)',
                    color: hasJoined ? '#6FCF97' : 'rgba(200,185,150,0.7)',
                  }}
                >
                  {hasJoined ? '? Sei in lista' : 'Unisciti alla lista d\\'attesa'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

`;
content = content.replace('export const LandingV2: React.FC = () => {', newComponents + '\nexport const LandingV2: React.FC = () => {');

// 3. Insert <CategoriesSection />
const splitSectionStart = '{/* -- SPLIT: img2 + testo — STORYTELLING FIX: testo, immagine invariata -- */}';
content = content.replace(splitSectionStart, '<CategoriesSection />\n\n        ' + splitSectionStart);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('Modified successfully');
