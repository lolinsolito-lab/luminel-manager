# 🛡️ 07 — Security & Anti-Fraud

> **Responsabile**: Security Engineer  
> **Ultimo aggiornamento**: 17 Giugno 2026  
> **Status**: ⚠️ Base solida, ma mancano protezioni critiche

---

## ✅ Protezioni GIÀ Implementate

### 1. Row Level Security (RLS) — Multi-Tenant Isolation
**Stato**: ✅ Attivo su tutte le tabelle

Ogni tabella ha una policy `FOR ALL USING (coach_id = auth.uid())`:

| Tabella | Policy | Effetto |
|---------|--------|---------|
| `users` | `auth.uid() = id` | Ogni utente vede solo il proprio profilo |
| `clients` | `coach_id = auth.uid()` | Ogni coach vede solo i suoi clienti |
| `sessions` | `coach_id = auth.uid()` | Ogni coach vede solo i suoi appuntamenti |
| `transactions` | `coach_id = auth.uid()` | Isolamento finanziario totale |
| `services` | `coach_id = auth.uid()` | Servizi privati per coach |
| `resources` | `coach_id = auth.uid()` | Libreria privata |
| `tasks` | `coach_id = auth.uid()` | Task privati |
| `campaigns` | `coach_id = auth.uid()` | Campagne private |
| `subscription_plans` | `FOR SELECT USING (true)` | Tutti possono leggere i piani |
| `founder_waitlist` | INSERT: anyone / SELECT: admin only | Chiunque può iscriversi |

### 2. Autenticazione Supabase
- ✅ Email + Password con hashing bcrypt
- ✅ Google OAuth
- ✅ Email verification obbligatoria (email_confirmed_at)
- ✅ Password reset via Resend SMTP
- ✅ JWT tokens con auto-refresh
- ✅ `persistSession: true` — nessun re-login inutile
- ✅ Auth state handler: solo tab con token si reindirizza (no redirect loop)

### 3. Protected Routes (Frontend)
- ✅ `ProtectedRoute`: redirect a `/login` se non autenticato
- ✅ `AdminRoute`: redirect a `/dashboard` se `user.email !== ADMIN_EMAIL`
- ✅ Splash intro: previene flash di contenuto non autorizzato

### 4. Feature Gating (Subscription)
- ✅ `SubscriptionContext` con `hasFeature()`, `canAddClient()`, `getLimit()`
- ✅ Popup upgrade se si supera il limite
- ✅ Feature flags granulari per 20+ funzionalità

### 5. Waitlist Security (Parziale)
- ✅ DB ha campo `ip_address INET` per anti-spam (ma non viene popolato!)
- ✅ DB ha campo `user_agent TEXT` per fingerprinting
- ✅ Email lowercase + trim (normalizzazione)
- ✅ Duplicate check su email
- ✅ `SECURITY DEFINER` sulle RPC functions
- ✅ Privacy Policy + Terms checkbox obbligatorio

### 6. Database Constraints
- ✅ `valid_subscription_tier` CHECK constraint
- ✅ `valid_subscription_status` CHECK constraint
- ✅ `valid_business_type` CHECK constraint
- ✅ `UNIQUE` su email in waitlist e users
- ✅ `ON DELETE CASCADE` per cleanup automatico

---

## ❌ Vulnerabilità e Protezioni MANCANTI

### 🔴 CRITICHE (Rischio Alto)

#### V1: Admin Email Hardcoded nel Bundle JS
- **File**: `App.tsx` riga 30
- **Problema**: `const ADMIN_EMAIL = 'jaramichael@hotmail.com'` è visibile nel JS compilato
- **Rischio**: Chiunque con DevTools vede chi è l'admin
- **Fix**: Creare campo `is_admin BOOLEAN` in `users` table, protetto da RLS. Verificare lato server.
- **Priorità**: 🔴 ALTA

#### V2: Anon Key nel Codice Sorgente
- **File**: `supabaseClient.ts` riga 38
- **Problema**: L'anon key Supabase è nel codice (anche se è by design)
- **Rischio**: Se RLS non è perfetto, la key espone le query
- **Fix**: Assicurarsi che la key sia SOLO da `.env`. Verificare TUTTE le RLS policies. La anon key è progettata per essere pubblica, ma le RLS devono essere perfette.
- **Priorità**: 🟡 MEDIA

#### V3: Stripe in Test Mode
- **File**: `stripePrices.ts`
- **Problema**: URL `buy.stripe.com/test_...` — non accettano pagamenti reali
- **Rischio**: Nessuno può pagare
- **Fix**: Creare Price IDs in Stripe Live mode. Aggiornare `stripePrices.ts`.
- **Priorità**: 🔴 CRITICA (blocca il lancio)

#### V4: No Webhook Stripe
- **Problema**: Il pagamento Stripe non notifica il backend
- **Rischio**: Un utente potrebbe pagare e non risultare attivato, o peggio, simulare un pagamento
- **Fix**: Creare Supabase Edge Function con Stripe Webhook per:
  - `checkout.session.completed` → attivare subscription
  - `customer.subscription.deleted` → disattivare
  - `invoice.payment_failed` → status `past_due`
- **Priorità**: 🔴 CRITICA

#### V5: IP Address Non Tracciato nella Waitlist
- **Problema**: Il campo `ip_address` esiste nel DB ma non viene mai popolato
- **Rischio**: Nessun rate limiting, un bot può fare 10.000 iscrizioni
- **Fix**: Passare `ip_address` dalla request header nella `join_founder_waitlist` RPC, o usare Supabase Edge Function per catturare l'IP
- **Priorità**: 🟡 MEDIA

### 🟡 IMPORTANTI (Rischio Medio)

#### V6: No CAPTCHA sul Form Waitlist
- **Problema**: Il form non ha protezione anti-bot
- **Fix**: Aggiungere Cloudflare Turnstile (gratuito) o hCaptcha
- **Priorità**: 🟡 MEDIA

#### V7: No Rate Limiting sulle API
- **Problema**: Nessun limite di richieste per utente
- **Fix**: Implementare rate limiting tramite Supabase Edge Functions o un proxy (Cloudflare Workers)
- **Priorità**: 🟡 MEDIA

#### V8: Subscription Check Solo Client-Side
- **Problema**: Il feature gating avviene nel React frontend — un utente tecnico potrebbe bypassarlo
- **Fix**: Aggiungere check lato server nelle RLS policies:
  ```sql
  CREATE POLICY "clients_within_limit" ON clients
    FOR INSERT USING (
      (SELECT COUNT(*) FROM clients WHERE coach_id = auth.uid()) 
      < (SELECT max_clients FROM subscription_plans sp 
         JOIN users u ON u.subscription_tier = sp.name 
         WHERE u.id = auth.uid())
    );
  ```
- **Priorità**: 🟡 MEDIA

#### V9: "Live Viewers" Simulati Possono Essere Scoperti
- **Problema**: `FounderLanding.tsx` ha "viewers" che cambiano random ogni 15s
- **Rischio**: Un utente attento potrebbe notare che i numeri sono finti
- **Fix**: O rimuovere, o collegare a dati reali (Google Analytics realtime API)
- **Priorità**: 🟢 BASSA

#### V10: Activity Feed Hardcoded
- **Problema**: "Marco ha appena scelto PRO" è hardcoded — non è un evento reale
- **Fix**: Collegare a eventi reali di `pending_subscriptions` o rimuovere
- **Priorità**: 🟢 BASSA

---

## 📋 GDPR Compliance

### ✅ Già in Regola
- Privacy Policy modal (FounderLanding)
- Terms of Service modal
- Cookie Policy modal
- Checkbox consenso obbligatorio prima della waitlist
- "Dati sicuri & Crittografati" badge visibile
- Email lowercase + trim (minimizzazione dati)

### ❌ Da Implementare
- [ ] Banner cookie consent (non solo il modal — serve il banner)
- [ ] Diritto all'oblio: endpoint per cancellare tutti i dati utente
- [ ] Export dati: possibilità per l'utente di esportare i propri dati
- [ ] DPA (Data Processing Agreement) con Supabase
- [ ] Registro dei trattamenti (documento interno)
- [ ] Nomina responsabile dati (DPO se >250 utenti)

---

## ✅ Checklist Security Pre-Lancio

- [ ] Spostare admin check in Supabase (non hardcoded)
- [ ] Attivare Stripe LIVE mode
- [ ] Creare Webhook Stripe in Edge Function
- [ ] Aggiungere CAPTCHA al form waitlist
- [ ] Popolare campo `ip_address` nella waitlist
- [ ] Verificare TUTTE le RLS policies con utente test
- [ ] Aggiungere cookie consent banner
- [ ] Testare: utente A non vede dati utente B
- [ ] Testare: utente Free non accede a feature Pro
- [ ] Testare: form waitlist non accetta duplicate
- [ ] Penetration test base (OWASP top 10)
