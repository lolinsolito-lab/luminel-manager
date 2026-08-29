const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// Replace the img tag in HolographicOrb to fix centering and effects
content = content.replace(
  "style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)', opacity: 0.88 }}",
  "style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1)', opacity: 0.95, mixBlendMode: 'screen' }}"
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('Fixed Hero image styling.');
