const fs = require('fs');

let content = fs.readFileSync('c:/luminel manager/components/FounderLanding.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { PlanId } from '../services/stripePrices';",
  "import { PlanId } from '../services/stripePrices';\nimport { STATIC_PRICING_PLANS, getMergedPricingPlans, TierPlan } from '../services/pricingPlans';"
);

// 2. Remove local PRICING_PLANS array
const oldPricingMatch = content.match(/\/\/ Pricing data v3.0.*?\];/s);
if (oldPricingMatch) {
  content = content.replace(oldPricingMatch[0], '');
}

// 3. Update useState type
content = content.replace(
  "const [plans, setPlans] = useState<typeof PRICING_PLANS | null>(null);",
  "const [plans, setPlans] = useState<TierPlan[] | null>(null);"
);

// 4. Update the DB merge logic
const dbMergeRegex = /const mapped = PRICING_PLANS\.map\(templatePlan => \{.*?\n\s+return null;[^\n]*\n\s+\}\)\.filter\(Boolean\);/s;
const newDbMerge = `const mapped = getMergedPricingPlans(plansData);`;
content = content.replace(dbMergeRegex, newDbMerge);

// 5. Replace references to priceFounder with priceFounderMonthly and priceAnnual with priceFounderAnnual
content = content.replace(/plan\.priceFounder(?!\w)/g, 'plan.priceFounderMonthly');
content = content.replace(/plan\.priceAnnual/g, 'plan.priceFounderAnnual');

fs.writeFileSync('c:/luminel manager/components/FounderLanding.tsx', content, 'utf8');
console.log('FounderLanding.tsx updated');
