const fs = require('fs');
let landing = fs.readFileSync('c:/luminel manager/components/LandingV3.tsx', 'utf8');

landing = landing.replace(
  /import \{ AiCoachHeroSection \} from '\.\/ui\/ai-coach-hero';/,
  "import { AiCoachHeroSection } from './ui/ai-coach-hero';\nimport { AnymaHeroSection } from './ui/anyma-hero';"
);

const startStr = "<main style={{ position: 'relative', zIndex: 10 }}>";
const endStr = "<ProblemSection />";
const startIdx = landing.indexOf(startStr);
const endIdx = landing.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const before = landing.substring(0, startIdx + startStr.length);
    const after = landing.substring(endIdx);
    
    const newHero = '\n\n        <AnymaHeroSection />\n\n        ';
    
    fs.writeFileSync('c:/luminel manager/components/LandingV3.tsx', before + newHero + after);
    console.log('Replaced Hero with AnymaHeroSection');
} else {
    console.log('Could not find start/end bounds for Hero');
}
