// Supabase Edge Function: Stripe Webhook Handler
// Deploy with: supabase functions deploy stripe-webhook
// 
// This function handles Stripe webhook events, specifically:
// - checkout.session.completed: Updates user subscription in database

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.10.0";

// Environment variables (set in Supabase Dashboard → Edge Functions → Secrets)
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
// FIX (29 ago 2026): dominio dell'app letto da secret, non più hardcoded.
// "app.luminelcoach.com" era solo un test, mai attivato — usava un dominio
// morto proprio nel link dentro l'email di benvenuto dopo un pagamento vero.
// Di default usa il dominio Vercel provvisorio, finché non ne attivi uno nuovo.
const APP_URL = Deno.env.get("APP_URL") || "https://luminel-manager.vercel.app";

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase with Service Role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Price ID to Tier mapping (update these with your actual price IDs)
// ⚠️ Questi sono Price ID di Stripe TEST MODE. Quando passi a LIVE, Stripe
// genera ID diversi anche per "lo stesso" prodotto — vanno aggiornati qui,
// altrimenti il webhook riceve il pagamento vero ma non lo riconosce e
// non attiva nulla, senza nessun errore visibile al cliente.
const PRICE_TO_TIER: Record<string, { tier: string; cycle: string }> = {
    // Starter
    "price_1Sk65GBXiYadZ8OVDiYnzozM": { tier: "starter", cycle: "monthly" },
    "price_1Sk65GBXiYadZ8OVOUODJRRb": { tier: "starter", cycle: "annual" },
    // Pro
    "price_1Sk65IBXiYadZ8OVwrIIMP04": { tier: "pro", cycle: "monthly" },
    "price_1Sk65IBXiYadZ8OVC8L3Wrxv": { tier: "pro", cycle: "annual" },
    // Signature
    "price_1Sk65KBXiYadZ8OVCunAw8Yc": { tier: "signature", cycle: "monthly" },
    "price_1Sk65KBXiYadZ8OVrDL5rPvU": { tier: "signature", cycle: "annual" },
    // Empire
    "price_1Sk65LBXiYadZ8OVjdEcb06f": { tier: "empire", cycle: "monthly" },
    "price_1Sk65MBXiYadZ8OVTWPuKJ7U": { tier: "empire", cycle: "annual" },
};

serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");

        if (!signature) {
            console.error("No Stripe signature found");
            return new Response("No signature", { status: 400 });
        }

        let event: Stripe.Event;
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error("Webhook signature verification failed:", err);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        console.log(`📩 Received Stripe event: ${event.type}`);

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCanceled(subscription);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(`Webhook Error: ${error.message}`, { status: 500 });
    }
});

/**
 * Handle checkout.session.completed event
 * This is triggered when a customer completes a payment
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    console.log("🎉 Processing checkout.session.completed");
    console.log("Session ID:", session.id);

    const customerEmail = session.customer_email
        || session.customer_details?.email
        || null;

    console.log("Customer Email:", customerEmail);
    console.log("Customer ID:", session.customer);

    if (!customerEmail) {
        console.error("No customer email found in session!");
        return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
        console.log("No subscription ID found (one-time payment?)");
        return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;

    if (!priceId) {
        console.error("No price ID found in subscription");
        return;
    }

    const tierInfo = PRICE_TO_TIER[priceId];
    if (!tierInfo) {
        console.error(`Unknown price ID: ${priceId}`);
        return;
    }

    console.log(`📦 Plan: ${tierInfo.tier} (${tierInfo.cycle})`);

    // ⚠️ NOTA APERTA (non risolta in questo fix): qui non c'è nessun controllo
    // sul tetto dei 25 posti Founder. Chiunque paghi tramite un Payment Link
    // Stripe diventa is_founding_member=true senza verifica. Da decidere se e
    // come limitarlo — segnalato, non ancora corretto.
    const { count: founderCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_founding_member", true);

    const { count: pendingCount } = await supabase
        .from("pending_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    const founderNumber = (founderCount || 0) + (pendingCount || 0) + 1;

    const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id, email, full_name")
        .eq("email", customerEmail)
        .single();

    if (existingUser && !userError) {
        console.log(`✅ User found: ${customerEmail}`);

        const { error } = await supabase
            .from("users")
            .update({
                subscription_tier: tierInfo.tier,
                subscription_status: "active",
                billing_cycle: tierInfo.cycle,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                is_founding_member: true,
                founding_member_since: new Date().toISOString(),
                founding_member_number: founderNumber,
                updated_at: new Date().toISOString(),
            })
            .eq("email", customerEmail);

        if (error) {
            console.error("Error updating user:", error);
            return;
        }

        console.log(`   Tier: ${tierInfo.tier}, Founder #${founderNumber}`);

        await sendEmail(customerEmail, "founder_welcome", {
            name: existingUser.full_name || customerEmail.split("@")[0] || "Founder",
            tier: tierInfo.tier,
            founderNumber: founderNumber,
        });

    } else {
        console.log(`⏳ User not found, saving to pending_subscriptions: ${customerEmail}`);

        const { error: pendingError } = await supabase
            .from("pending_subscriptions")
            .upsert({
                email: customerEmail,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                subscription_tier: tierInfo.tier,
                billing_cycle: tierInfo.cycle,
                is_founding_member: true,
                founding_member_number: founderNumber,
                checkout_session_id: session.id,
                status: "pending",
            }, { onConflict: "email" });

        if (pendingError) {
            console.error("Error saving pending subscription:", pendingError);
            return;
        }

        console.log(`   Saved pending: ${tierInfo.tier}, Founder #${founderNumber}`);

        // FIX: usa APP_URL (secret, dominio Vercel di default) invece di
        // "app.luminelcoach.com" hardcoded — dominio mai attivato, link morto
        const registrationUrl = `${APP_URL}/#/register?email=${encodeURIComponent(customerEmail)}`;

        await sendEmail(customerEmail, "invite_registration", {
            tier: tierInfo.tier,
            founderNumber: founderNumber,
            registrationUrl: registrationUrl,
        });
    }
}

async function sendEmail(to: string, type: string, data: Record<string, unknown>) {
    try {
        const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ to, type, data }),
        });

        if (emailResponse.ok) {
            console.log(`📧 ${type} email sent to ${to}`);
        } else {
            console.error("Email send failed:", await emailResponse.text());
        }
    } catch (emailError) {
        console.error("Error sending email:", emailError);
    }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    console.log("🔄 Processing subscription update");

    const priceId = subscription.items.data[0]?.price.id;
    const tierInfo = PRICE_TO_TIER[priceId];

    if (!tierInfo) {
        console.error(`Unknown price ID: ${priceId}`);
        return;
    }

    const status = subscription.status === "active" ? "active" : "past_due";

    const { error } = await supabase
        .from("users")
        .update({
            subscription_tier: tierInfo.tier,
            subscription_status: status,
            billing_cycle: tierInfo.cycle,
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

    if (error) {
        console.error("Error updating subscription:", error);
    }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    console.log("❌ Processing subscription cancellation");

    const { error } = await supabase
        .from("users")
        .update({
            subscription_tier: "free",
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

    if (error) {
        console.error("Error canceling subscription:", error);
    }
}