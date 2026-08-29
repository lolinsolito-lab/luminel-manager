const fs = require('fs');
const path = require('path');
const filePath = 'c:\\luminel manager\\components\\AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const loadAllDataRegex = /const loadAllData = async \(\) => \{[\s\S]*?loadPendingSubscriptions\(\),\s*loadUsers\(activePricing\)\s*\]\);\s*\} catch \(error\) \{\s*console\.error\('Error loading admin data:', error\);\s*\}\s*setIsLoading\(false\);\s*\};/;

const newLoadAllData = `const loadAllData = async () => {
        setIsLoading(true);
        try {
            let activePricing: any = null;

            try {
                const { getSubscriptionPlans } = await import('../services/waitlistService');
                const dbPlans = await getSubscriptionPlans();
                if (dbPlans && dbPlans.length > 0) {
                    activePricing = {};
                    dbPlans.forEach((plan: any) => {
                        activePricing[plan.name] = {
                            monthly: Number(plan.price_monthly_founder),
                            annual: Number(plan.price_annual_founder)
                        };
                    });
                    const simpleMap: Record<string, number> = {};
                    Object.keys(activePricing).forEach(k => simpleMap[k] = activePricing[k].monthly);
                    setTierPricing(simpleMap);
                }
            } catch (e) {
                console.warn('Could not load pricing from DB');
            }

            await Promise.all([
                loadPendingSubscriptions(),
                loadUsers(activePricing)
            ]);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
        setIsLoading(false);
    };`;

const loadUsersRegex = /const loadUsers = async \(pricingMap = tierPricing\) => \{[\s\S]*?setRevenueStats\(\{[\s\S]*?\}\);\s*\}\s*\};/;

const newLoadUsers = `const loadUsers = async (pricingMap: any = null) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setUsers(data);

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const byTier: Record<string, number> = {};
            let foundingMembers = 0;
            let thisMonth = 0;
            let mrr = 0;

            data.forEach(user => {
                const tier = user.subscription_tier || 'free';
                byTier[tier] = (byTier[tier] || 0) + 1;

                if (user.is_founding_member) foundingMembers++;
                if (new Date(user.created_at) >= startOfMonth) thisMonth++;

                if (pricingMap && pricingMap[tier] && user.subscription_status === 'active') {
                    if (user.billing_cycle === 'annual') {
                        mrr += Math.round(pricingMap[tier].annual / 12);
                    } else {
                        mrr += pricingMap[tier].monthly;
                    }
                }
            });

            setUserStats({
                total: data.length,
                byTier,
                foundingMembers,
                thisMonth
            });

            const revenueByTier: Record<string, number> = {};
            if (pricingMap) {
                Object.entries(byTier).forEach(([tier, count]) => {
                    revenueByTier[tier] = (pricingMap[tier]?.monthly || 0) * count;
                });
            }

            setRevenueStats({
                mrr,
                byTier: revenueByTier
            });
        }
    };`;

content = content.replace(loadAllDataRegex, newLoadAllData);
content = content.replace(loadUsersRegex, newLoadUsers);

fs.writeFileSync(filePath, content);
console.log("AdminDashboard patched successfully");
