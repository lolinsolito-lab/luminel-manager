const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/services/pricingPlans.ts', 'utf8');

// 1. Add maxUsers, maxClients, maxSessions to TierPlan interface
content = content.replace(
  "features: string[];",
  "features: string[];\n  maxUsers?: number;\n  maxClients?: number;\n  maxSessions?: number;"
);

// 2. Add limits to STATIC_PRICING_PLANS
content = content.replace(
  "popular: false,\n  },\n  {\n    id: 'pro'",
  "popular: false,\n    maxUsers: 1, maxClients: 50, maxSessions: 100,\n  },\n  {\n    id: 'pro'"
);
content = content.replace(
  "popular: true,\n  },\n  {\n    id: 'signature'",
  "popular: true,\n    maxUsers: 5, maxClients: 250, maxSessions: 500,\n  },\n  {\n    id: 'signature'"
);
content = content.replace(
  "popular: false,\n  },\n  {\n    id: 'empire'",
  "popular: false,\n    maxUsers: 10, maxClients: 500, maxSessions: -1,\n  },\n  {\n    id: 'empire'"
);
content = content.replace(
  "popular: false,\n  },\n];",
  "popular: false,\n    maxUsers: -1, maxClients: -1, maxSessions: -1,\n  },\n];"
);

// 3. Add getDiscountPercent function
content += `\n
export const getDiscountPercent = (plan: TierPlan): number => {
  if (plan.pricePublic && plan.priceFounderMonthly) {
    return Math.round(((plan.pricePublic - plan.priceFounderMonthly) / plan.pricePublic) * 100);
  }
  return 0;
};
`;

fs.writeFileSync('c:/luminel manager/services/pricingPlans.ts', content, 'utf8');
console.log('Updated pricingPlans.ts');
