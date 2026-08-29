const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/services/pricingPlans.ts', 'utf8');

content = content.replace(
  "priceFounderAnnual: Number(dbPlan.price_annual_founder) || staticPlan.priceFounderAnnual,",
  "priceFounderAnnual: Number(dbPlan.price_annual_founder) || staticPlan.priceFounderAnnual,\n        maxUsers: dbPlan.max_users !== undefined ? dbPlan.max_users : staticPlan.maxUsers,\n        maxClients: dbPlan.max_clients !== undefined ? dbPlan.max_clients : staticPlan.maxClients,\n        maxSessions: dbPlan.max_sessions_per_month !== undefined ? dbPlan.max_sessions_per_month : staticPlan.maxSessions,"
);

fs.writeFileSync('c:/luminel manager/services/pricingPlans.ts', content, 'utf8');
console.log('Updated getMergedPricingPlans');
