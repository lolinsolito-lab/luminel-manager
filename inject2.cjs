const fs = require('fs');
let code = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

const newSections = `
const MichaelStorySection: React.FC = () => (
  <section style={{ maxWidth: '64rem', margin: '0 auto', padding: '8rem 1.5rem', borderTop: borderLine }}>
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        position: 'relative',
        borderRadius: '1.5rem',
        background: 'rgba(12,11,9,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(240,232,210,0.1)',
        overflow: 'hidden',
        boxShadow: \`0 20px 40px -10px rgba(0,0,0,0.5), 0 0 40px -10px \${C.glow}\`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '3.5rem', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.goldMid, display: 'block', marginBottom: '1.25rem' }}>
            Il Creatore-Ribelle
          </span>
          <h3 style={{ fontSize: '2.5rem', fontFamily: 'Georgia,serif', color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Dal Caos alla Calma: <br/><span style={{ color: C.gold, fontStyle: 'italic' }}>IL 2:47 AM</span>
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '2rem' }}>
            "Lavoravo 73 ore a settimana, perdevo appuntamenti ed ero schiavo del mio stesso successo. Luminel non è nato in una sala riunioni: è nato alle 2:47 del mattino per salvare il mio tempo e la mia salute mentale. Oggi gestisco tutto in 35 minuti al giorno."
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img src="/assets/michael-jara.png" alt="Michael" style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: \`1px solid \${C.goldDim}\`, objectFit: 'cover' }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Michael Jara</div>
              <div style={{ color: C.goldDim, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Founder, Luminel</div>
            </div>
          </div>
        </div>
        
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-2rem', background: \`radial-gradient(circle at center, \${C.glow}, transparent 70%)\`, filter: 'blur(30px)' }} />
          <img src="/assets/images/media_1787944837542.jpg" alt="Coding at night" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }} />
        </div>
      </div>
    </motion.div>
  </section>
);

const METRICS = [
  { title: 'TEMPO RISPARMIATO', value: '+3.2', suffix: ' ORE/GIORNO', desc: 'Rispetto all\\'uso di Excel + WhatsApp.', icon: Clock },
  { title: 'TASSO DI ADOZIONE', value: '94', suffix: '%', desc: 'Tra Coach, Saloni e Professionisti del benessere.', icon: Activity },
  { title: 'RIDUZIONE ERRORI', value: '-78', suffix: '%', desc: 'No-show e doppi appuntamenti azzerati.', icon: Check },
  { title: 'WHATSAPP AUTOMATION', value: '24', suffix: '/7', desc: 'Promemoria automatici e proattivi ai clienti.', icon: Sparkles }
];

const MetricsGridSection: React.FC = () => {
  return (
    <section style={{ maxWidth: '88rem', margin: '0 auto', padding: '6rem 1.5rem 8rem', borderTop: borderLine }}>
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: C.goldMid, display: 'block', marginBottom: '1.25rem' }}>
          Metriche di Eccellenza
        </span>
        <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontFamily: 'Georgia,serif', color: '#fff' }}>I Numeri dell'Efficienza</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{
                background: 'rgba(12,11,9,0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(240,232,210,0.06)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
              whileHover={{ 
                y: -8, 
                borderColor: C.goldDim, 
                boxShadow: \`0 15px 40px -10px rgba(0,0,0,0.8), 0 0 30px -10px \${C.glow}, inset 0 1px 0 rgba(255,255,255,0.1)\` 
              }}
            >
              <motion.div
                animate={{ opacity: [0.1, 0.7, 0.1], backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px', 
                  background: \`linear-gradient(90deg, transparent, \${C.gold}, transparent)\`,
                  backgroundSize: '200% 100%'
                }}
              />
              
              <Icon style={{ width: '2rem', height: '2rem', marginBottom: '1.5rem', color: C.goldMid }} />
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', fontWeight: 600 }}>
                {m.title}
              </h4>
              <div style={{ fontSize: '3rem', fontWeight: 300, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '6px', fontFamily: 'Georgia,serif' }}>
                <span>{m.value}</span>
                <span style={{ fontSize: '1.25rem', color: C.goldMid, fontFamily: 'system-ui' }}>{m.suffix}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                {m.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
`;

let hasChanged = false;

if (code.includes('export const LandingV2: React.FC = () => {')) {
  code = code.replace("export const LandingV2: React.FC = () => {", newSections + "\nexport const LandingV2: React.FC = () => {");
  hasChanged = true;
}

if (code.includes('<CategoriesSection />')) {
  code = code.replace(
    "<CategoriesSection />",
    "<MichaelStorySection />\n          <CategoriesSection />"
  );
}

if (code.includes('<PricingSection />')) {
  code = code.replace(
    "<PricingSection />",
    "<MetricsGridSection />\n          <PricingSection />"
  );
}

const badgeCode = `
                {p.id === 'pro' && (
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
                    <div title="Founder Badge" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(200,185,150,0.15), rgba(200,185,150,0.02))', border: \`1px solid \${C.goldDim}\`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: \`0 0 20px \${C.glow}\` }}>
                      <span style={{ fontSize: '1.2rem' }}>??</span>
                    </div>
                  </div>
                )}
                {p.id === 'empire' && (
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
                    <div title="Empire Tier Badge" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.02))', border: '1px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(168,85,247,0.2)' }}>
                      <span style={{ fontSize: '1.2rem' }}>???</span>
                    </div>
                  </div>
                )}
`;

if (code.includes('{p.popular && (')) {
  code = code.replace(
    "{p.popular && (",
    badgeCode + "\n                {p.popular && ("
  );
}

if (hasChanged) {
  fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', code, 'utf8');
  console.log('Successfully injected code into LandingV2.tsx');
} else {
  console.log('Failed to find insertion points.');
}
