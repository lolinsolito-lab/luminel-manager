const fs = require('fs');

const chunksText = fs.readFileSync('c:\\luminel manager\\recovered_chunks.txt', 'utf8');
let landing = fs.readFileSync('c:\\luminel manager\\components\\LandingV2.tsx', 'utf8');

// Function to extract a chunk accurately
function extractChunk(uniqueStr) {
  // Split the file into chunks by "CHUNK:\n"
  const allChunks = chunksText.split('\nCHUNK:\n');
  for (let i = allChunks.length - 1; i >= 0; i--) {
    let part = allChunks[i];
    // Remove trailing separators
    part = part.split('==========================================')[0].trim();
    if (part.includes(uniqueStr)) {
      return part;
    }
  }
  return null;
}

// 1. Restore the Hero Spline
const heroNew = extractChunk('<Card className="w-full max-w-7xl h-[600px] md:h-[750px]');
if (heroNew) {
  landing = landing.replace(
    /<motion\.section style={{ opacity: heroOpacity, minHeight: '100vh'.*?<\/motion\.section>/s,
    '<motion.section style={{ opacity: heroOpacity, minHeight: \'100vh\', display: \'flex\', flexDirection: \'column\', alignItems: \'center\', justifyContent: \'center\', paddingTop: \'6rem\', paddingBottom: \'2.5rem\', padding: \'6rem 1.5rem 2.5rem\' }}>\n          ' + heroNew + '\n        </motion.section>'
  );
}

// 2. ProblemSection
const problemNew = extractChunk('const STREAM_IMAGES = [');
if (problemNew) {
  landing = landing.replace(
    /const PAIN_POINTS.*?(?=\n\/\/ --- SEZIONE: Il Futuro)/s,
    problemNew + '\n'
  );
}

// 3. FutureSection
const futureNew = extractChunk('const FUTURE_CARDS = [');
if (futureNew) {
  landing = landing.replace(
    /const FUTURE_CARDS.*?(?=\n\/\/ --- SEZIONE: Il Piano)/s,
    futureNew + '\n'
  );
}

// 4. PlanSection
const planNew = extractChunk('const PLAN_STEPS = [');
if (planNew) {
  landing = landing.replace(
    /const PLAN_STEPS.*?(?=\n\/\/ --- SEZIONE: E Se Non Fai Nulla\?)/s,
    planNew + '\n'
  );
}

// 5. FailureSection
const failureNew = extractChunk('const FAILURE_STAGES = [');
if (failureNew) {
  landing = landing.replace(
    /const FAILURE_STAGES.*?(?=\n\/\/ --- SEZIONE: Lead Magnet)/s,
    failureNew + '\n'
  );
}

// 6. EcosystemSection
const ecoNew = extractChunk('const ECOSYSTEM_PRODUCTS = [');
if (ecoNew) {
  landing = landing.replace(
    /const ECOSYSTEM_PRODUCTS.*?(?=\nconst MetricsGridSection: React\.FC = \(\) => \{)/s,
    ecoNew + '\n\n'
  );
}

// 7. Add Imports
landing = landing.replace(
  /import \{ getSubscriptionPlans \} from '\.\.\/services\/waitlistService';/,
  `import { getSubscriptionPlans } from '../services/waitlistService';\nimport { SplineScene } from "./ui/splite";\nimport { Card } from "./ui/card";\nimport { Spotlight } from "./ui/spotlight";\nimport { WordsPullUp } from "./ui/words-pull-up";\nimport { ImageStreamHero } from "./ui/image-stream-hero";\nimport { ColorChangeCards } from "./ui/color-change-card";\nimport { PlanSection } from './ui/plan-section';\nimport { CategoriesSection } from './ui/categories-section';\nimport { AiCoachHeroSection } from './ui/ai-coach-hero';`
);

// 8. Replace id="soluzioni" with AiCoachHeroSection
landing = landing.replace(
  /\{false && \(\s*<section id="soluzioni".*?<\/section>\s*\)\}/s,
  '<AiCoachHeroSection />'
);

// 9. Hide EcosystemSection
landing = landing.replace(
  /<EcosystemSection \/>/g,
  '{false && <EcosystemSection />}'
);

fs.writeFileSync('c:\\luminel manager\\components\\LandingV3.tsx', landing);
console.log('Restored LandingV3.tsx successfully!');
