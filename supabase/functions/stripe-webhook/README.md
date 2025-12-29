# 🔗 Stripe Webhook - Supabase Edge Function

Questa Edge Function gestisce i webhook di Stripe per attivare automaticamente gli abbonamenti.

## 📋 Eventi Gestiti

| Evento | Azione |
| --- | --- |
| `checkout.session.completed` | Attiva account, imposta tier e badge Founder |
| `customer.subscription.updated` | Aggiorna tier se l'utente cambia piano |
| `customer.subscription.deleted` | Imposta tier a "free" quando cancella |

---

## 🚀 Deployment

### 1. Installa Supabase CLI

```bash
npm install -g supabase
```

### 2. Login a Supabase

```bash
supabase login
```

### 3. Link al Progetto

```bash
cd "c:\Lumina Manager"
supabase link --project-ref xrdvmujlqibsucmkluru
```

### 4. Configura i Secrets

Vai su **Supabase Dashboard → Edge Functions → Secrets** e aggiungi:

| Secret Name | Valore |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_test_51Sjdmf...` (la tua chiave segreta) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (lo otterrai dopo step 6) |
| `SUPABASE_URL` | `https://xrdvmujlqibsucmkluru.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (dalla dashboard Supabase → Settings → API) |

### 5. Deploy della Funzione

```bash
supabase functions deploy stripe-webhook
```

### 6. Configura Webhook in Stripe

1. Vai su [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Clicca "Add Endpoint"
3. URL: `https://xrdvmujlqibsucmkluru.supabase.co/functions/v1/stripe-webhook`
4. Seleziona eventi:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copia il **Signing Secret** (`whsec_...`) e aggiungilo ai Secrets Supabase

---

## 🧪 Test Locale

```bash
supabase functions serve stripe-webhook --env-file .env
```

Poi usa Stripe CLI per testare:
```bash
stripe trigger checkout.session.completed
```

---

## ✅ Verifica

Dopo il deploy, quando un utente completa un pagamento:
1. Stripe invia il webhook
2. La funzione aggiorna il database
3. L'utente vede i badge Founding Member al login

🏛️ **Luminel Empire Ready!**
