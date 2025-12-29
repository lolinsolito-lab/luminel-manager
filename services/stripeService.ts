import { STRIPE_PRICES, PlanId, BillingCycle } from './stripePrices';

/**
 * STRIPE SERVICE
 * 
 * Handles the redirection to Stripe Payment Links.
 */
export const stripeService = {
    /**
     * Redirects the user to the Stripe Checkout page for a specific plan and cycle.
     */
    redirectToCheckout: (planId: PlanId, cycle: BillingCycle) => {
        try {
            const plan = STRIPE_PRICES[planId];
            if (!plan) {
                throw new Error(`Plan ${planId} not found in Stripe Price mapping.`);
            }

            const checkoutUrl = plan[cycle].url;
            console.log(`🚀 Redirecting to Stripe Checkout: ${planId} (${cycle})`);
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('❌ Error in stripeService.redirectToCheckout:', error);
            alert('Spiacenti, si è verificato un errore nel caricamento del pagamento. Riprova più tardi.');
        }
    }
};

export default stripeService;
