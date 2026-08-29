const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// 1. Dashboard Size
// original: gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))'
// new: gridTemplateColumns: 'minmax(300px, 1.5fr) minmax(300px, 1fr)'
content = content.replace(
  "gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))'",
  "gridTemplateColumns: 'minmax(300px, 1.5fr) minmax(300px, 1fr)'"
);
// Make the image slightly larger with a scale
content = content.replace(
  "style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}",
  "style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.7)', transform: 'scale(1.08)', transformOrigin: 'center left' }}"
);

// 2. Ecosistema image: swap to media_1787930226434.png
content = content.replace(
  '<AnimatedImg src="/assets/images/media_1787930246309.png" alt="Ecosistema"',
  '<AnimatedImg src="/assets/images/media_1787930226434.png" alt="Ecosistema"'
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('Fixed dashboard size and ecosystem image.');
