const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// Dashboard Split Section
content = content.replace('/assets/images/media_1787930214760.png', '/assets/images/media_1787944837657.jpg');

// Security Card
content = content.replace('/assets/images/media_1787930221023.png', '/assets/images/media_1787944837526.png');

// Wide two heads (Ecosistema & CTA)
content = content.replace(/\/assets\/images\/media_1787930226434\.png/g, '/assets/images/media_1787944837651.jpg');

// AI Coach Card (it uses 1787930209631.png which is also used in Hero. We want to replace it only in the AI Coach Card context)
// Context: <AnimatedImg src="/assets/images/media_1787930209631.png" alt="AI Coach" style={{ position: 'absolute', inset: 0, height: '100%', borderRadius: 0 }} />
content = content.replace(
  '<AnimatedImg src="/assets/images/media_1787930209631.png" alt="AI Coach"',
  '<AnimatedImg src="/assets/images/media_1787944837542.jpg" alt="AI Coach"'
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('Images replaced in LandingV2.tsx');
