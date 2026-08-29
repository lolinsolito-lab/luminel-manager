const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

content = content.replace(
  "gridTemplateColumns: 'minmax(300px, 1.5fr) minmax(300px, 1fr)'",
  "gridTemplateColumns: 'minmax(300px, 3fr) minmax(300px, 1fr)'"
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
console.log('Fixed dashboard width to 75%');
