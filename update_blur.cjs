const fs = require('fs');
let code = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

code = code.replace(
  "background: 'rgba(12,11,9,0.7)',",
  "background: 'rgba(12,11,9,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',"
);

code = code.replace(
  "background: 'rgba(12,11,9,0.8)',",
  "background: 'rgba(12,11,9,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',"
);

fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', code, 'utf8');
console.log("Added backdrop-filter.");
