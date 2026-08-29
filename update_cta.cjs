const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// Find the Final CTA section and replace the image in it
const finalCtaStart = 'FINAL CTA';
const idx = content.indexOf(finalCtaStart);
if (idx !== -1) {
  const before = content.substring(0, idx);
  let after = content.substring(idx);
  after = after.replace('/assets/images/media_1787944837651.jpg', '/assets/images/foto 7 lading.png');
  // Just in case it was not media_1787944837651.jpg (e.g. if the previous replace didn't work), fallback:
  after = after.replace('/assets/images/media_1787930226434.png', '/assets/images/foto 7 lading.png');
  
  content = before + after;
  fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
  console.log('Final CTA image replaced.');
} else {
  console.log('FINAL CTA section not found.');
}
