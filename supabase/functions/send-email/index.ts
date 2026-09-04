// Supabase Edge Function: Send Email with Resend
// Deploy with: supabase functions deploy send-email
//
// This function sends transactional emails using Resend API

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Environment variables
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Luminel <noreply@luminelcoach.com>";
const APP_URL = Deno.env.get("APP_URL") || "https://luminel-manager.vercel.app";

// Email types
type EmailType = "founder_welcome" | "payment_receipt" | "subscription_canceled" | "invite_registration";

interface EmailRequest {
  to: string;
  type: EmailType;
  data?: {
    name?: string;
    tier?: string;
    founderNumber?: number;
    price?: string;
    registrationUrl?: string;
  };
}

// Email templates - Royal Luxury Design
const EMAIL_TEMPLATES: Record<EmailType, { subject: string; html: (data: EmailRequest["data"]) => string }> = {
  founder_welcome: {
    subject: "👑 Benvenuto nell'Élite Luminel, Founding Member",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, sans-serif; background: linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%);">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1c1917 0%, #0f0d0c 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.15); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 80px rgba(251, 191, 36, 0.1);">
    
    <!-- Decorative Top Border -->
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #fbbf24 20%, #f59e0b 50%, #fbbf24 80%, transparent 100%);"></div>
    
    <!-- Header with Crown Logo -->
    <div style="padding: 50px 40px 30px; text-align: center; background: radial-gradient(ellipse at center top, rgba(251, 191, 36, 0.08) 0%, transparent 70%);">
      <!-- Crown Icon -->
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3), inset 0 -3px 10px rgba(0,0,0,0.2);">
        <span style="font-size: 40px; line-height: 80px;">👑</span>
      </div>
      <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; color: #fbbf24; font-size: 14px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase;">
        Founding Member
      </h1>
      <div style="font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 48px; font-weight: 700; margin: 10px 0 0; text-shadow: 0 2px 20px rgba(251, 191, 36, 0.3);">
        #${data?.founderNumber || "?"}
      </div>
    </div>
    
    <!-- Divider -->
    <div style="margin: 0 40px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%);"></div>
    
    <!-- Body Content -->
    <div style="padding: 40px;">
      <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #ffffff; margin: 0 0 25px 0; font-size: 28px; font-weight: 600; line-height: 1.3;">
        Benvenuto nell'Élite, ${data?.name || "Founder"}
      </h2>
      
      <p style="color: #a8a29e; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
        Sei entrato a far parte di un <span style="color: #fbbf24; font-weight: 500;">circolo esclusivo</span> di visionari che stanno ridefinendo il futuro della gestione per saloni di bellezza.
      </p>
      
      <p style="color: #d6d3d1; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
        Il tuo piano <strong style="color: #ffffff; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${data?.tier?.toUpperCase() || "PREMIUM"}</strong> è ora attivo con il <span style="color: #fbbf24;">prezzo Founder bloccato per sempre</span>.
      </p>
      
      <!-- Luxury Benefits Card -->
      <div style="background: linear-gradient(145deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 16px; padding: 30px; margin: 0 0 35px 0;">
        <h3 style="font-family: 'Playfair Display', Georgia, serif; color: #fbbf24; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
          <span style="margin-right: 12px;">✨</span> I Tuoi Privilegi Esclusivi
        </h3>
        <div style="color: #d6d3d1; font-size: 15px; line-height: 2.2;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #fbbf24; margin-right: 12px;">◆</span> Prezzo Founder bloccato a vita
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #fbbf24; margin-right: 12px;">◆</span> Badge esclusivo #${data?.founderNumber || "?"} nel profilo
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #fbbf24; margin-right: 12px;">◆</span> Accesso prioritario alle nuove funzionalità
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #fbbf24; margin-right: 12px;">◆</span> Linea diretta con il team Luminel
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); color: #0c0a09; text-decoration: none; padding: 18px 50px; border-radius: 14px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3), 0 0 0 1px rgba(255,255,255,0.1) inset; transition: all 0.3s;">
          Accedi alla Dashboard →
        </a>
      </div>
      
      <p style="color: #78716c; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center; font-style: italic;">
        "Grazie per aver creduto in Luminel. Sei parte della nostra storia."
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(180deg, #0c0a09 0%, #0a0908 100%); padding: 30px 40px; text-align: center; border-top: 1px solid rgba(251, 191, 36, 0.1);">
      <div style="font-family: 'Playfair Display', Georgia, serif; color: #fbbf24; font-size: 20px; font-weight: 600; margin-bottom: 10px;">
        LUMINEL
      </div>
      <p style="color: #57534e; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Luminel Manager · 
        <a href="https://luminelcoach.com" style="color: #78716c; text-decoration: none;">luminelcoach.com</a>
      </p>
    </div>
    
    <!-- Decorative Bottom Border -->
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #fbbf24 20%, #f59e0b 50%, #fbbf24 80%, transparent 100%);"></div>
    
  </div>
</body>
</html>
    `,
  },

  payment_receipt: {
    subject: "💎 Ricevuta del Pagamento - Luminel",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, sans-serif; background: linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%);">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1c1917 0%, #0f0d0c 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.15); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);">
    
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #fbbf24 20%, #f59e0b 50%, #fbbf24 80%, transparent 100%);"></div>
    
    <div style="padding: 50px 40px 30px; text-align: center;">
      <div style="width: 70px; height: 70px; margin: 0 auto 20px; background: linear-gradient(145deg, #fbbf24 0%, #d97706 100%); border-radius: 50%; line-height: 70px; font-size: 32px; box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);">💎</div>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 28px; margin: 0;">Pagamento Confermato</h1>
    </div>
    
    <div style="margin: 0 40px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%);"></div>
    
    <div style="padding: 40px;">
      <p style="color: #d6d3d1; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
        Ciao <strong style="color: #ffffff;">${data?.name || "Cliente"}</strong>,
      </p>
      <p style="color: #a8a29e; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
        Abbiamo ricevuto con successo il tuo pagamento.
      </p>
      
      <div style="background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.15); border-radius: 16px; padding: 25px; margin: 0 0 30px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <span style="color: #78716c;">Piano</span>
          <span style="color: #fbbf24; font-weight: 600;">${data?.tier?.toUpperCase() || "PREMIUM"}</span>
        </div>
        <div style="height: 1px; background: rgba(251, 191, 36, 0.1); margin: 15px 0;"></div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #78716c;">Importo</span>
          <span style="color: #ffffff; font-weight: 600; font-size: 18px;">${data?.price || "—"}</span>
        </div>
      </div>
      
      <p style="color: #78716c; font-size: 14px; text-align: center; margin: 0;">
        Grazie per essere parte della famiglia Luminel ✨
      </p>
    </div>
    
    <div style="background: #0a0908; padding: 25px 40px; text-align: center; border-top: 1px solid rgba(251, 191, 36, 0.1);">
      <div style="font-family: 'Playfair Display', Georgia, serif; color: #fbbf24; font-size: 18px; margin-bottom: 8px;">LUMINEL</div>
      <p style="color: #57534e; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Luminel Manager</p>
    </div>
    
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #fbbf24 20%, #f59e0b 50%, #fbbf24 80%, transparent 100%);"></div>
  </div>
</body>
</html>
    `,
  },

  subscription_canceled: {
    subject: "💫 Arrivederci, amico - Luminel",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, sans-serif; background: linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%);">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1c1917 0%, #0f0d0c 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(120, 113, 108, 0.2); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);">
    
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #78716c 20%, #a8a29e 50%, #78716c 80%, transparent 100%);"></div>
    
    <div style="padding: 50px 40px 30px; text-align: center;">
      <div style="width: 70px; height: 70px; margin: 0 auto 20px; background: linear-gradient(145deg, #44403c 0%, #292524 100%); border-radius: 50%; line-height: 70px; font-size: 32px;">💫</div>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 28px; margin: 0;">Ci Mancherai</h1>
    </div>
    
    <div style="margin: 0 40px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(168, 162, 158, 0.3) 50%, transparent 100%);"></div>
    
    <div style="padding: 40px;">
      <p style="color: #d6d3d1; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
        Ciao <strong style="color: #ffffff;">${data?.name || "Amico"}</strong>,
      </p>
      <p style="color: #a8a29e; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
        Il tuo abbonamento Luminel è stato cancellato. È stato un piacere averti con noi.
      </p>
      <p style="color: #a8a29e; font-size: 16px; line-height: 1.8; margin: 0 0 35px 0;">
        Se cambi idea, le porte del nostro mondo saranno sempre aperte per te.
      </p>
      
      <div style="text-align: center;">
        <a href="https://luminelcoach.com" style="display: inline-block; background: linear-gradient(135deg, #44403c 0%, #292524 100%); color: #d6d3d1; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 500; font-size: 15px; border: 1px solid rgba(168, 162, 158, 0.2);">
          Torna quando vuoi →
        </a>
      </div>
    </div>
    
    <div style="background: #0a0908; padding: 25px 40px; text-align: center; border-top: 1px solid rgba(120, 113, 108, 0.1);">
      <div style="font-family: 'Playfair Display', Georgia, serif; color: #78716c; font-size: 18px; margin-bottom: 8px;">LUMINEL</div>
      <p style="color: #57534e; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Luminel Manager</p>
    </div>
    
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #78716c 20%, #a8a29e 50%, #78716c 80%, transparent 100%);"></div>
  </div>
</body>
</html>
    `,
  },

  invite_registration: {
    subject: "👑 Pagamento Confermato - Attiva il Tuo Account",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, sans-serif; background: linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%);">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1c1917 0%, #0f0d0c 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.15); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 80px rgba(251, 191, 36, 0.1);">
    
    <!-- Decorative Top Border -->
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #fbbf24 20%, #f59e0b 50%, #fbbf24 80%, transparent 100%);"></div>
    
    <!-- Header -->
    <div style="padding: 50px 40px 30px; text-align: center; background: radial-gradient(ellipse at center top, rgba(251, 191, 36, 0.08) 0%, transparent 70%);">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(145deg, #22c55e 0%, #16a34a 50%, #15803d 100%); border-radius: 50%; line-height: 80px; font-size: 40px; box-shadow: 0 10px 40px rgba(34, 197, 94, 0.3);">✓</div>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #22c55e; font-size: 14px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 10px 0;">
        Pagamento Confermato
      </h1>
      <div style="font-family: 'Playfair Display', Georgia, serif; color: #ffffff; font-size: 32px; font-weight: 600;">
        Benvenuto nell'Élite
      </div>
    </div>
    
    <!-- Divider -->
    <div style="margin: 0 40px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%);"></div>
    
    <!-- Body Content -->
    <div style="padding: 40px;">
      <p style="color: #d6d3d1; font-size: 17px; line-height: 1.8; margin: 0 0 25px 0; text-align: center;">
        Sei a un passo dall'attivare il tuo account <span style="color: #fbbf24; font-weight: 600;">${data?.tier?.toUpperCase() || "PREMIUM"}</span>
      </p>
      
      <!-- Founder Badge Preview -->
      <div style="background: linear-gradient(145deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 16px; padding: 25px; margin: 0 0 35px 0; text-align: center;">
        <div style="color: #78716c; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;">Il Tuo Badge Esclusivo</div>
        <div style="font-family: 'Playfair Display', Georgia, serif; color: #fbbf24; font-size: 28px; font-weight: 700;">
          👑 Founding Member #${data?.founderNumber || "?"}
        </div>
        <div style="color: #a8a29e; font-size: 14px; margin-top: 10px;">Prezzo bloccato per sempre</div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data?.registrationUrl || APP_URL + "/login"}" style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); color: #0c0a09; text-decoration: none; padding: 20px 60px; border-radius: 14px; font-weight: 600; font-size: 17px; letter-spacing: 0.5px; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;">
          Completa la Registrazione →
        </a>
      </div>
      
      <!-- Important Note -->
      <div style="background: rgba(251, 191, 36, 0.05); border-radius: 12px; padding: 20px; text-align: center;">
        <p style="color: #a8a29e; font-size: 14px; line-height: 1.6; margin: 0;">
          <span style="color: #fbbf24;">⚡ Importante:</span> Usa la stessa email del pagamento per collegare automaticamente il tuo abbonamento.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(180deg, #0c0a09 0%, #0a0908 100%); padding: 30px 40px; text-align: center; border-top: 1px solid rgba(251, 191, 36, 0.1);">
      <div style="font-family: 'Playfair Display', Georgia, serif; color: #fbbf24; font-size: 20px; font-weight: 600; margin-bottom: 10px;">
        LUMINEL
      </div>
      <p style="color: #57534e; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Luminel Manager · 
        <a href="https://luminelcoach.com" style="color: #78716c; text-decoration: none;">luminelcoach.com</a>
      </p>
    </div>
    
    <!-- Decorative Bottom Border -->
    <div style="height: 4px; background: linear-gradient(90deg, transparent 0%, #fbbf24 20%, #f59e0b 50%, #fbbf24 80%, transparent 100%);"></div>
    
  </div>
</body>
</html>
    `,
  },
};

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { to, type, data } = body;

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'type'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const template = EMAIL_TEMPLATES[type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown email type: ${type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 Sending ${type} email to ${to}`);

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: template.subject,
        html: template.html(data),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Email send failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Email sent successfully: ${result.id}`);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
