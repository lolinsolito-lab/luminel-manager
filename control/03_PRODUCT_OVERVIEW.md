# 📦 03 — Product Overview

> **Responsabile**: Product Manager  
> **Ultimo aggiornamento**: 17 Giugno 2026  
> **Status**: ✅ Prodotto funzionante — Fase Pre-Lancio

---

## 🎯 Cos'è Luminel Manager

**Luminel Manager** è un **gestionale SaaS premium** progettato esclusivamente per **professionisti del benessere** (parrucchieri, estetiste, coach, tattoo artist, massaggiatori).

### Il Problema che Risolve
> Il 92% dei professionisti del benessere passa più tempo a **gestire il business** che a **servire i clienti**. Usano 5+ strumenti diversi (Excel, WhatsApp, Google Calendar, bloc notes, email) perdendo 4+ ore al giorno in admin.

### La Soluzione
> **Un unico strumento premium** che unisce CRM, Calendario, Finance, AI Coach, Team Management e Analytics in un'interfaccia da luxury brand — configurabile in 47 minuti, gestibile in 19 minuti/giorno.

---

## 🖥️ Cosa Vede il Cliente nella Dashboard

### 📊 Dashboard Overview (`/dashboard`)
Il cuore dell'app. Appena entri vedi:

| Sezione | Descrizione |
|---------|-------------|
| **KPI Cards** | 4 card con: Revenue mensile, Sessioni completate, Clienti totali, Vendite del mese — tutti da dati reali Supabase |
| **Progress Bar Revenue** | Barra verso target €15.000/mese con percentuale |
| **Revenue Chart** | Grafico a area (Recharts) del fatturato settimanale |
| **Sessioni di Oggi** | Lista con countdown ai prossimi appuntamenti |
| **Task Manager** | To-do list cloud con priorità (Urgente/Normale/Low) e categorie (Follow-up, Admin, Sales, Content) |
| **Quick Actions** | 3 pulsanti: Quick Task, Nuovo Cliente, Nuova Sessione |
| **AI Coach** | Chatbot floating con Gemini AI che ha accesso ai dati della dashboard |

### 📅 Calendario (`/calendar`)
- Vista giornaliera/settimanale/mensile
- Drag & drop appuntamenti
- Colori per tipo (1:1, gruppo, online, in studio)
- Status: Confermato, Completato, Cancellato, No Show
- Anti-overbooking: controllo cabine/stanze configurabili
- Reminder automatici 24h e 1h prima

### 👥 CRM Clienti (`/clients`)
- Lista clienti con avatar, status (Attivo, VIP, At Risk, Nuovo, Inattivo)
- Profilo cliente completo: storico sessioni, revenue, loyalty points
- Segmentazione per fonte (Google, Instagram, Referral, Evento)
- Note private per cliente
- Invio WhatsApp diretto
- Filtri avanzati e ricerca
- **Limiti per tier**: 50 clienti (Starter), 250 (Pro), 500 (Signature), ∞ (Empire)

### 💳 Finance (`/finance`)
- Transazioni: Entrate, Uscite, Payroll
- Fatture con export PDF (jsPDF)
- Metodi di pagamento: Carta, Bonifico, Contante, Stripe
- Revenue mensile con grafico
- P&L semplificato
- Status pagamenti: Pending, Pagato, Scaduto

### 📊 Analytics (`/analytics`)
- KPI avanzati con trend
- Retention rate
- Valore medio sessione
- Top programmi per revenue
- Crescita clienti mese su mese
- Grafici comparativi

### 👥 Team (`/team`)
- Gestione collaboratori
- Assegnazione ruoli
- Calendario condiviso
- **Limiti**: 1 utente (Starter), 5 (Pro), 10 (Signature), ∞ (Empire)

### 📚 Programmi (`/programs`)
- Servizi/Trattamenti offerti
- Prezzo e durata
- Categorie: Coaching, Holistic, Workshop, Retreat, Bodywork
- Statistiche booking e revenue per servizio

### 📖 Libreria Risorse (`/resources`)
- Upload file: Audio, PDF, Video, Link
- Tag per categorizzare
- Contatore invii
- **Limiti**: 10 (Starter), 100 (Pro), 500 (Signature), ∞ (Empire)

### ⚙️ Impostazioni (`/settings`)
3 tab:
1. **General**: Nome business, Logo upload (Supabase Storage), P.IVA, indirizzo, valuta, fuso orario
2. **Schedule**: Orari apertura per giorno + configurazione cabine/stanze
3. **Integrations**: Supabase Cloud status, Google Calendar, Stripe, Zoom

### 🤖 AI Coach (floating)
- Chatbot Gemini AI
- Accesso al contesto business (revenue, clienti, sessioni)
- Suggerimenti: "Analizza retention", "Strategia fatturato", "Post Social"
- Quick prompts preimpostati

---

## 🔒 Cosa il Cliente NON Può Fare

| Azione | Motivo |
|--------|--------|
| Vedere dati di altri coach | RLS Supabase — isolamento totale |
| Superare i limiti del tier | Feature gating: popup upgrade se supera il limite |
| Accedere a `/admin` | Solo email admin hardcodata |
| Usare AI senza tier Pro+ | Feature gating (in base al piano) |
| White-label senza Empire | Feature esclusiva tier Empire |
| API access senza Signature+ | Disponibile solo da Signature in su |

---

## 🛣️ User Journey

```
1. SCOPERTA
   └─ Vede ad su Instagram/Google → Arriva su HomeLanding (/)

2. INTERESSE  
   └─ Legge StoryBrand → Pain points → Vede dashboard preview → CTA "Reclama Posto"

3. CONVERSIONE
   └─ Va su FounderLanding (/founder) → Vede prezzi → Countdown urgency → Waitlist form

4. PAGAMENTO
   └─ Scegli piano → Stripe Checkout → PaymentSuccess (/success)

5. ONBOARDING
   └─ Registrazione (/login) → Splash intro animata → Dashboard (/dashboard)

6. ATTIVAZIONE
   └─ Setup settings (47min) → Primo cliente → Prima sessione

7. RETENTION
   └─ AI Coach suggerimenti → Notifiche → Task manager → Monthly analytics

8. UPGRADE
   └─ Raggiunge limite → Popup upgrade → Nuovo Stripe Checkout

9. REFERRAL (Futuro)
   └─ Invita colleghi → Bonus → Loop crescita
```

---

## 📱 Funzionalità per Tier

| Feature | Free | Starter | Pro | Signature | Empire |
|---------|------|---------|-----|-----------|--------|
| Dashboard KPI | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendario | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRM Base | ✅ | ✅ | ✅ | ✅ | ✅ |
| Max Clienti | 5 | 50 | 250 | 500 | ∞ |
| Max Sessioni/mese | 10 | 100 | 500 | ∞ | ∞ |
| Team Members | 0 | 1 | 5 | 10 | ∞ |
| AI Coach | ❌ | Base | Pro | Pro | Empire |
| WhatsApp | ❌ | ❌ | ✅ | ✅ | ✅ |
| Fatturazione | ❌ | ❌ | ✅ | ✅ | ✅ |
| PDF Export | ❌ | ❌ | ✅ | ✅ | ✅ |
| Loyalty Program | ❌ | ❌ | ❌ | ✅ | ✅ |
| Team Analytics | ❌ | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | Read-only | Full |
| White-Label | ❌ | ❌ | ❌ | ❌ | ✅ |
| Success Manager | ❌ | ❌ | ❌ | ❌ | ✅ |
| Sedi | 1 | 1 | 1 | 2 | ∞ |
