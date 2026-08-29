import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// FIX (29 ago 2026): stesso secret FROM_EMAIL usato da send-email, invece di
// "onboarding@resend.dev" scritto fisso nel codice. Quell'indirizzo è la
// sandbox di Resend — funziona solo verso la tua email verificata, non verso
// clienti veri, finché non hai un dominio verificato su Resend. Con questo
// fix, basta cambiare il secret FROM_EMAIL su Supabase quando il dominio è
// pronto, senza toccare codice, e le due funzioni restano coerenti tra loro.
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Luminel Elite <onboarding@resend.dev>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, resourceTitle, resourceUrl, message, businessName, senderName } = await req.json()

    const htmlContent = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 12px; color: #1c1917;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ce9341; font-size: 24px; letter-spacing: 2px;">LUMINEL ELITE</h1>
          <p style="text-transform: uppercase; font-size: 10px; tracking: 0.2em; color: #78716c;">Premium Professional Management</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Gentile Cliente,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">${message}</p>
        
        <div style="background-color: #fafaf9; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">${resourceTitle}</h2>
          <p style="font-size: 14px; color: #78716c; margin-bottom: 20px;">Accedi ora al contenuto esclusivo preparato per te.</p>
          <a href="${resourceUrl}" style="display: inline-block; background-color: #1c1917; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">APRI RISORSA</a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #78716c; margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
          Cordiali saluti,<br>
          <strong>${senderName}</strong><br>
          ${businessName}
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <p style="font-size: 10px; color: #a8a29e; uppercase; letter-spacing: 1px;">
            Powered by Luminel Elite
          </p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: `[LUMINEL] Nuova risorsa condivisa: ${resourceTitle}`,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})