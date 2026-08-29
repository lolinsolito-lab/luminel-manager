# 💰 12 — Modello Finanziario & Unit Economics

> **Responsabile**: Direttore (Revenue Strategist + Tech Lead + Finance)
> **Ultimo aggiornamento**: 28 Agosto 2026
> **Status**: 🆕 Primo modello basato su dati di costo reali (API pricing agosto 2026)
> **Sostituisce/integra**: `06_PRICING_STRATEGY.md` (mantiene la strategia di posizionamento, qui si aggiunge il lato costi)

---

## ⚠️ Prerequisito non negoziabile

Questo intero modello presuppone che tu **unifichi i prezzi su un'unica fonte di verità prima del lancio**. Uso qui i valori del DB (`migration_v2.0_subscriptions.sql`) come canonici, perché sono quelli con cui gira `AdminDashboard` e quindi il tuo MRR reale:

| Piano | Pubblico | Founder Mensile | Founder Annuale |
|-------|----------|------------------|-------------------|
| Starter | €59 | €39 | €390 |
| Pro ⭐ | €119 | €79 | €790 |
| Signature 🔥 | €179 | €109 | €1.090 |
| Empire 👑 | €299 | €179 | €1.790 |

Se decidi di tenere i valori di `FounderLanding.tsx` (59/33, 99/55, 159/88, 249/138) invece, **tutti i numeri sotto vanno ricalcolati** — ma la struttura del ragionamento non cambia.

---

## 1️⃣ Struttura dei Costi Variabili (per singolo utente pagante/mese)

### 1a. Stripe (elaborazione pagamenti, EU standard)
Formula: ~1,5% + €0,25 per transazione riuscita (1 al mese per abbonamento)

| Piano | Founder | Costo Stripe |
|-------|---------|--------------|
| Starter | €39 | €0,84 |
| Pro | €79 | €1,44 |
| Signature | €109 | €1,89 |
| Empire | €179 | €2,94 |

### 1b. Costo AI — VirtualTwin (conversazioni WhatsApp/IG/Messenger, alto volume)

Stima conversazioni/mese per tier (legata ai limiti clienti già definiti in `03_PRODUCT_OVERVIEW.md`):

| Tier | Clienti max | Conversazioni AI/mese (stima) | Token stimati/mese |
|------|-------------|-------------------------------|----------------------|
| Starter | 50 | ~20 | ~120K input / 24K output |
| Pro | 250 | ~80 | ~480K input / 96K output |
| Signature | 500 | ~150 | ~900K input / 180K output |
| Empire | ∞ (stimato 1.000) | ~300 | ~1,8M input / 360K output |

**Con Gemini 3.1 Flash-Lite** ($0,25 / $1,50 per milione token):
| Tier | Costo/mese |
|------|-----------|
| Starter | ~€0,06 |
| Pro | ~€0,24 |
| Signature | ~€0,45 |
| Empire | ~€0,90 |

**Con Claude Haiku 4.5** ($1 / $5 per milione token):
| Tier | Costo/mese |
|------|-----------|
| Starter | ~€0,20 |
| Pro | ~€0,80 |
| Signature | ~€1,50 |
| Empire | ~€3,00 |

### 1c. Costo AI — AI Coach interno (dashboard, basso volume, alto valore percepito)
Stima: 30 query/mese × ~2.000 input + 500 output token (con contesto business iniettato)

| Modello | Costo/mese/utente |
|---------|--------------------|
| Gemini 3.1 Flash-Lite | ~€0,01 |
| Claude Sonnet 5 (intro $2/$10) | ~€0,27 |
| Claude Haiku 4.5 | ~€0,09 |

### 🎯 Conclusione costi AI
**Anche nello scenario più caro (Claude Sonnet 5 ovunque, Empire tier), il costo AI totale resta sotto €3,5/mese — meno dell'1,5% del prezzo del piano.** La scelta del provider AI non è una decisione di costo, è una decisione di qualità percepita. Vedi sezione 5.

---

## 2️⃣ Contribution Margin per Tier (Founder pricing)

Contribution margin = Prezzo − Stripe − AI (usando Claude ovunque, scenario più conservativo)

| Piano | Prezzo Founder | Stripe | AI (Claude) | **Margine** | **% Margine** |
|-------|-----------------|--------|--------------|--------------|----------------|
| Starter | €39,00 | €0,84 | €0,20 | **€37,96** | **97,3%** |
| Pro | €79,00 | €1,44 | €0,80 | **€76,76** | **97,2%** |
| Signature | €109,00 | €1,89 | €1,50 | **€105,61** | **96,9%** |
| Empire | €179,00 | €2,94 | €3,00 | **€173,06** | **96,7%** |

Questi sono margini da SaaS eccellente — in linea con benchmark di settore (75-85% è "buono", 90%+ è "ottimo"). Il messaggio chiave: **il tuo problema non sarà mai il costo per servire un cliente. Sarà sempre e solo trovarne e trattenerne abbastanza.**

---

## 3️⃣ Costi Fissi & Break-Even

### Costi fissi mensili (da `11_ECOSYSTEM_MAP.md`, invariati)

| Fase | Costo Totale/mese |
|------|---------------------|
| Pre-lancio (0-25 utenti) | ~€3-10 |
| Post-lancio (100-500 utenti) | ~€60-150 |
| Scala (500+ utenti) | ~€310 |

### Break-even reale
Con ARPU Founder medio ~€70-100/mese e costi fissi di ~€310/mese a regime:

> **Servono 3-5 utenti paganti per coprire tutti i costi infrastrutturali fissi.**

Questo è il dato più importante di tutto il documento: **non stai costruendo un business con un problema di unit economics. Stai costruendo un business con un problema di distribuzione.** Ogni euro e ogni ora che investi da qui in avanti deve andare a risolvere "come trovo e mantengo clienti", non "come riduco i costi" — i costi sono già irrilevanti alla tua scala.

---

## 4️⃣ Founder Pricing a Scala — Pro e Contro (dati, non opinioni)

### Il costo reale dello sconto Founder
Ipotesi: 25 Founder fissi per sempre, resto della base a prezzo pubblico. A 1.200 utenti totali (milestone €1M ARR):

- 25 Founder × (ARPU pubblico medio ~€120 − ARPU Founder medio ~€70) = **~€1.250/mese di ricavo "perso"** rispetto a se pagassero tutti pubblico
- Su una base di 1.200 utenti, è lo **0,6% del MRR totale a quel punto**. Irrilevante finanziariamente.

### ✅ Pro
- Costo reale a scala: trascurabile (vedi sopra)
- Riduce strutturalmente il churn dei primi 25 (lock-in emotivo documentato in `06_PRICING_STRATEGY.md`)
- Se anche solo 30-40% dei Founder porta un referral pagante, il CAC di quei 25 è già ripagato

### ❌ Contro — il vero rischio non è finanziario, è di fiducia
- Il tuo `01_BRAND_IDENTITY.md` elenca "Fiducia" come valore cardine ("RLS Supabase, crittografia, GDPR compliance")
- Ma oggi il contatore "22 posti rimasti" è **hardcoded**, non reale — e i tuoi utenti target (professionisti, non consumatori ingenui) sanno riconoscere un countdown finto
- Se anche un solo Founding Member scopre che i "posti limitati" erano finti, il danno reputazionale in una nicchia piccola e passaparola-dipendente (coach, saloni) è sproporzionato rispetto al beneficio dello sconto
- **Raccomandazione**: 25 posti reali, contati dal DB, non dall'UI hardcoded. Meglio pochi posti veri che tanti posti finti.

---

## 5️⃣ Decisione AI Provider — Raccomandazione

Dato che il costo è irrilevante a queste scale (Sezione 1), la decisione si basa su 3 criteri reali:

| Criterio | Gemini (Flash-Lite/Flash) | Claude (Haiku/Sonnet) |
|----------|----------------------------|--------------------------|
| Qualità conversazione in italiano naturale | Buona | Generalmente superiore su tono/sfumature |
| Coerenza su conversazioni lunghe (negoziazione WhatsApp) | Buona | Storicamente più solida su context-tracking |
| Complessità d'integrazione | 2 provider = 2 SDK, 2 fatture, 2 rate limit da monitorare | — |
| Brand fit ("Premium", "Élite", mai "cheap" — da `04_COPYWRITING_GUIDE.md`) | Neutro | Coerente con posizionamento premium |

**Raccomandazione**: consolida su **Claude** per entrambi gli usi (VirtualTwin + AI Coach interno). Il differenziale di costo (qualche euro/mese/utente nello scenario peggiore) è statisticamente nullo rispetto al margine del 97%, mentre avere un solo provider significa un solo SDK da mantenere, un solo posto dove monitorare rate limit e affidabilità, e una qualità di conversazione più coerente con un brand che si vende come "premium/élite" e non come "il più economico". Se in futuro VirtualTwin scala su **tutto** l'ecosistema (VirtualBNB incluso, quindi decine di migliaia di conversazioni/mese), si potrà rivalutare con batch API e prompt caching — ma non è il problema di oggi.

---

## 6️⃣ Scenari di Scala — €1M ARR (da ricalibrare su timeline reale)

I dati di `09_GROWTH_ROADMAP.md` restano validi come *struttura*, ma le date (Fase 1 chiusa a luglio 2026) sono già superate al 28 agosto 2026. Tre scenari a margine costante (~97%):

| Scenario | Ritmo acquisizione | Utenti a 12 mesi | Utenti a 24 mesi | MRR a 24 mesi |
|----------|----------------------|---------------------|---------------------|-----------------|
| 🐢 Conservativo | 15 nuovi/mese | ~180 | ~400 | ~€28.000 |
| 🚶 Moderato (piano originale) | 33 nuovi/mese | ~400 | ~825 | ~€97.000 |
| 🚀 Aggressivo | 60 nuovi/mese | ~720 | ~1.450 | ~€145.000 |

Il moltiplicatore reale tra questi scenari non è la qualità del prodotto (già solido) ma **ore/settimana dedicate a vendita, contenuti e partnership** — la leva che ancora non abbiamo quantificato insieme.

---

## 📌 Azioni Immediate Collegate a Questo Documento
1. Decidere ufficialmente: 25 o 100 posti Founder — e farlo contare dal DB ovunque
2. Consolidare su Claude come provider AI unico (VirtualTwin + AI Coach)
3. Fixare la fonte prezzi unica (blocca anche questo modello finanziario)
4. Ricalcolare `09_GROWTH_ROADMAP.md` con date reali post-pausa universitaria
