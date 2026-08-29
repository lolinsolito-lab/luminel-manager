const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// Replace Hero image
content = content.replace(
  '<img\n            src="/assets/images/media_1787930209631.png"',
  '<img\n            src="/assets/images/media_1787944837526.png"'
);

// Revert Security Card image to padlock
content = content.replace(
  '<AnimatedImg src="/assets/images/media_1787944837526.png" alt="Sicurezza"',
  '<AnimatedImg src="/assets/images/media_1787930221023.png" alt="Sicurezza"'
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log("Images updated.");
