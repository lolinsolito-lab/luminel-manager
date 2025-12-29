# 📧 Email Service - Supabase Edge Function

Questa Edge Function invia email transazionali usando Resend API.

## 📋 Tipi di Email Supportati

| Tipo | Quando | Contenuto |
| --- | --- | --- |
| `founder_welcome` | Dopo checkout | Badge Founder, benefici, CTA |
| `payment_receipt` | Dopo pagamento | Ricevuta del pagamento |
| `subscription_canceled` | Cancellazione | Messaggio di arrivederci |

---

## 🚀 Setup Resend

### 1. Crea Account Resend
Vai su [resend.com](https://resend.com) e registrati.

### 2. Ottieni API Key
Dashboard Resend → API Keys → Create API Key

### 3. Verifica Dominio (opzionale ma consigliato)
Dashboard Resend → Domains → Add Domain

---

## 🔧 Deployment

### 1. Aggiungi Secrets in Supabase
Dashboard Supabase → Edge Functions → Secrets:

| Secret | Valore |
| --- | --- |
| `RESEND_API_KEY` | `re_xxxxx` (da Resend) |
| `FROM_EMAIL` | `Luminel <noreply@tuodominio.it>` |

### 2. Deploy
```bash
supabase functions deploy send-email
```

---

## 📨 Come Usare

La funzione è chiamata automaticamente dal webhook Stripe quando qualcuno completa un pagamento.

### Chiamata manuale (per test):
```bash
curl -X POST 'https://xrdvmujlqibsucmkluru.supabase.co/functions/v1/send-email' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "to": "test@example.com",
    "type": "founder_welcome",
    "data": {
      "name": "Mario",
      "tier": "pro",
      "founderNumber": 5
    }
  }'
```

---

## ✅ Flusso Automatico

1. Utente paga su Stripe
2. `stripe-webhook` aggiorna il database
3. `stripe-webhook` chiama `send-email`
4. Utente riceve email di benvenuto 🎉

🏛️ **Luminel Empire - Email Ready!**
