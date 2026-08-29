const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// 1. Reduce height from 300vh to 220vh (smoother scroll)
content = content.replace(
  "position: 'relative', height: '300vh', borderTop: borderLine",
  "position: 'relative', height: '220vh', borderTop: borderLine"
);

// 2. Add scroll progress dots to the sticky inner div
// Find the sticky inner container and add dots inside it
const stickyContainerEnd = "gap: '3rem', overflow: 'hidden' }>";
const dotsHTML = `gap: '3rem', overflow: 'hidden' }}>
            {/* Progress dots */}
            <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.6rem', zIndex: 30 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: activeFeature === i ? 20 : 6, height: 6, borderRadius: 3, background: activeFeature === i ? C.gold : 'rgba(240,232,210,0.2)', transition: 'all 0.4s ease', boxShadow: activeFeature === i ? \`0 0 8px \${C.gold}\` : 'none' }} />
              ))}
            </div>`;

content = content.replace(stickyContainerEnd, dotsHTML);

// 3. Fix the scroll ratio thresholds for 220vh
content = content.replace(
  "if (ratio < 0.34) setActiveFeature(0);\n      else if (ratio < 0.67) setActiveFeature(1);\n      else setActiveFeature(2);",
  "if (ratio < 0.33) setActiveFeature(0);\n      else if (ratio < 0.66) setActiveFeature(1);\n      else setActiveFeature(2);"
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('SUCCESS');
