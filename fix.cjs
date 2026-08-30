const fs = require('fs');

let landing = fs.readFileSync('c:/luminel manager/components/LandingV3.tsx', 'utf8');
const chunks = fs.readFileSync('c:/luminel manager/recovered_chunks.txt', 'utf8');

const planSectionRegex = /const PlanSection: React\.FC = \(\) => \([\s\S]*?<\/section>\s*\);/;
const matchChunk = chunks.match(planSectionRegex);

if (matchChunk && landing.includes('null')) {
    landing = landing.replace(/\n\s*null\s*\n/, '\n\n' + matchChunk[0] + '\n\n');
    console.log('Restored PlanSection');
}

const soluzioniRegex = /<section id="soluzioni"[\s\S]*?<\/section>/;
if (landing.match(soluzioniRegex)) {
    landing = landing.replace(soluzioniRegex, '<AiCoachHeroSection />');
    console.log('Replaced old soluzioni section with AiCoachHeroSection');
}

landing = landing.replace(/\{false && <EcosystemSection \/>\}/g, '<EcosystemSection />'); 
landing = landing.replace(/<EcosystemSection \/>/g, '{false && <EcosystemSection />}'); 
console.log('Hid EcosystemSection');

if (!landing.includes('<PlanSection />') && landing.includes('<FutureSection />')) {
    landing = landing.replace(/<FutureSection \/>/g, '<FutureSection />\n        <PlanSection />');
    console.log('Added <PlanSection /> to render');
}

fs.writeFileSync('c:/luminel manager/components/LandingV3.tsx', landing);
