const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV3.tsx', 'utf8');

// 1. Orb size
content = content.replace(
    "style={{ position: 'relative', width: 'clamp(260px,38vw,480px)', height: 'clamp(260px,38vw,480px)', margin: '0 auto' }}",
    "style={{ position: 'relative', width: 'clamp(320px,45vw,550px)', height: 'clamp(320px,45vw,550px)', margin: '0 auto' }}"
);

// 2. Orb contents
content = content.replace(
    /        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba\(240,232,210,0\.15\)', boxShadow: '0 0 60px rgba\(240,232,210,0\.25\), inset 0 0 60px rgba\(0,0,0,0\.8\)', overflow: 'hidden', zIndex: 10 }}>[\s\S]*?<\/div>/,
    \        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(240,232,210,0.15)', boxShadow: '0 0 60px rgba(240,232,210,0.25), inset 0 0 60px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 10 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, black 0%, transparent 55%)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)', zIndex: 11, pointerEvents: 'none' }} />
          
          <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full scale-[1.2]"
            />
          </div>

          <div style={{ position: 'absolute', inset: 0, zIndex: 12, background: 'radial-gradient(ellipse at 40% 30%, rgba(240,232,210,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        </div>\
);

// 3. Moon radiuses
content = content.replace(
    "{ icon: Brain, title: 'AI Coach Attivo', sub: 'Contesto business live', radius: 190, duration: 22, delay: 0, color: C.gold },",
    "{ icon: Brain, title: 'AI Coach Attivo', sub: 'Contesto business live', radius: 240, duration: 22, delay: 0, color: C.gold },"
).replace(
    "{ icon: Activity, title: 'Fatturato Mese', sub: '+12.4% vs mese scorso', radius: 205, duration: 26, delay: -9, color: C.goldMid },",
    "{ icon: Activity, title: 'Fatturato Mese', sub: '+12.4% vs mese scorso', radius: 255, duration: 26, delay: -9, color: C.goldMid },"
).replace(
    "{ icon: Lock, title: 'Zero Overbooking', sub: 'Calendario protetto', radius: 175, duration: 30, delay: -18, color: '#6FCF97' },",
    "{ icon: Lock, title: 'Zero Overbooking', sub: 'Calendario protetto', radius: 225, duration: 30, delay: -18, color: '#6FCF97' },"
);

// 4. Replace main rendering
content = content.replace(
    /                \{\/\* Right content \*\/\}\s*<div className="flex-1 relative min-h-\[300px\] md:min-h-full">\s*<SplineScene\s*scene="https:\/\/prod\.spline\.design\/kZDDjO5HuC9GJUM2\/scene\.splinecode"\s*className="w-full h-full"\s*\/>\s*<\/div>/,
    \                {/* Right content */}
                <div className="flex-1 relative min-h-[400px] md:min-h-full flex items-center justify-center pointer-events-auto z-50">
                  <HolographicOrb />
                </div>\
);

fs.writeFileSync('c:/luminel manager/components/LandingV3.tsx', content);
console.log('Successfully applied all changes for HolographicOrb SplineScene integration!');
