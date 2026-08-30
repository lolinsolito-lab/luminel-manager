const fs = require('fs');
const landing = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');
const chunks = fs.readFileSync('c:/luminel manager/recovered_chunks.txt', 'utf8');

function getChunk(str) {
  const allParts = chunks.split('CHUNK:');
  for (let i = allParts.length - 1; i >= 0; i--) {
    let p = allParts[i].split('==========================================')[0].trim();
    if (p.includes(str)) return p;
  }
  return null;
}

const problemChunk = getChunk('const STREAM_IMAGES = [');
const futureChunk = getChunk('const FUTURE_CARDS = [');
const planChunk = getChunk('const PlanSection: React.FC = () => (');
const failureChunk = getChunk('const FAILURE_STAGES = [');
const ecosystemChunk = getChunk('const ECOSYSTEM_PRODUCTS = [');
const heroChunk = getChunk('<Card className="w-full max-w-7xl h-[600px] md:h-[750px]');

let newLanding = landing;

// 1. Hero
newLanding = newLanding.replace(
  /<motion\.section style={{ opacity: heroOpacity, minHeight: '100vh'.*?<\/motion\.section>/s,
  '<motion.section style={{ opacity: heroOpacity, minHeight: \'100vh\', display: \'flex\', flexDirection: \'column\', alignItems: \'center\', justifyContent: \'center\', paddingTop: \'6rem\', paddingBottom: \'2.5rem\', padding: \'6rem 1.5rem 2.5rem\' }}>\n          ' + heroChunk + '\n        </motion.section>'
);

// 2. PAIN_POINTS and ProblemSection
newLanding = newLanding.replace(
  /const PAIN_POINTS = \[.*?const PLAN_STEPS = \[/s,
  problemChunk + '\n\n' + futureChunk + '\n\nconst PLAN_STEPS = ['
);

// 3. PLAN_STEPS and PlanSection
newLanding = newLanding.replace(
  /const PlanSection: React\.FC = \(\) => \(.*?const FAILURE_STAGES = \[/s,
  planChunk + '\n\nconst FAILURE_STAGES = ['
);

// 4. FAILURE_STAGES and FailureSection
newLanding = newLanding.replace(
  /const FAILURE_STAGES = \[.*?const LeadMagnetSection: React\.FC/s,
  failureChunk + '\n\nconst LeadMagnetSection: React.FC'
);

// 5. EcosystemSection
newLanding = newLanding.replace(
  /const MetricsGridSection: React\.FC = \(\) => \{/s,
  ecosystemChunk + '\n\nconst MetricsGridSection: React.FC = () => {'
);

// 6. AiCoachHeroSection
newLanding = newLanding.replace(
  /\{false && \(\s*<section id="soluzioni".*?<\/section>\s*\)\}/s,
  '<AiCoachHeroSection />'
);

// Add missing EcosystemSection call in render (hidden)
newLanding = newLanding.replace(
  /<MetricsGridSection \/>/s,
  '{false && <EcosystemSection />}\n        <MetricsGridSection />'
);

// Add imports
newLanding = newLanding.replace(
  /import \{ getSubscriptionPlans \} from '\.\.\/services\/waitlistService';/,
  "import { getSubscriptionPlans } from '../services/waitlistService';\nimport { SplineScene } from './ui/splite';\nimport { Card } from './ui/card';\nimport { Spotlight } from './ui/spotlight';\nimport { WordsPullUp } from './ui/words-pull-up';\nimport { ImageStreamHero } from './ui/image-stream-hero';\nimport { ColorChangeCards } from './ui/color-change-card';\nimport { AiCoachHeroSection } from './ui/ai-coach-hero';"
);

// Rename LandingV2 to LandingV3
newLanding = newLanding.replace(
  /export const LandingV2: React\.FC = \(\) => \{/,
  'export const LandingV3: React.FC = () => {'
);

fs.writeFileSync('c:/luminel manager/components/LandingV3.tsx', newLanding);
console.log('Restored successfully!');
