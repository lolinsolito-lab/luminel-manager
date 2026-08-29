const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

content = content.replace(
  /\/assets\/images\/media_1787930226434\.png/g,
  '/assets/images/media_1787930226434.jpg'
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('Fixed extension to .jpg');
