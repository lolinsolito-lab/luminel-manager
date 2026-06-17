# 💰 06 — Pricing Strategy

> **Responsabile**: Revenue Strategist  
> **Ultimo aggiornamento**: 17 Giugno 2026  
> **Status**: ⚠️ Incoerenze trovate — RIVEDERE prima del lancio

---

## 💳 Tabella Prezzi Corrente

### Prezzi Pubblici (Post-Founder)

| Piano | Mensile | Annuale (equiv. mensile) |
|-------|---------|--------------------------|
| **Starter** | €59/m | — |
| **Pro** ⭐ | €119/m | — |
| **Signature** 🔥 | €179/m | — |
| **Empire** 👑 | €299/m | — |

> **Fonte**: DB `subscription_plans` in `migration_v2.0_subscriptions.sql`

### Prezzi Founder (-44% bloccati a vita)

| Piano | Mensile Founder | Annuale Founder | Sconto vs Pubblico |
|-------|----------------|-----------------|-------------------|
| **Starter** | €39/m | €390/anno (€32.5/m) | -34% |
| **Pro** ⭐ | €79/m | €790/anno (€65.8/m) | -34% |
| **Signature** 🔥 | €109/m | €1.090/anno (€90.8/m) | -39% |
| **Empire** 👑 | €179/m | €1.790/anno (€149.2/m) | -40% |

> **Fonte**: DB `subscription_plans` in `migration_v2.0_subscriptions.sql`

---

## ⚠️ INCOERENZE TROVATE — DA RISOLVERE

> [!CAUTION]
> I prezzi mostrati nell'UI della FounderLanding NON corrispondono ai prezzi nel database. Ci sono **3 fonti di verità diverse** che dicono cose diverse.

### Fonte 1: Database (`migration_v2.0_subscriptions.sql`)
| Piano | Pubblico | Founder Mensile | Founder Annuale |
|-------|----------|----------------|-----------------|
| Starter | €59 | €39 | €390 |
| Pro | €119 | €79 | €790 |
| Signature | €179 | €109 | €1.090 |
| Empire | €299 | €179 | €1.790 |

### Fonte 2: FounderLanding.tsx (hardcoded nell'array `PLANS`)
| Piano | Pubblico | Founder Mensile | Sconto mostrato |
|-------|----------|----------------|-----------------|
| Starter | €59 | €33 | 44% |
| Pro | €99 | €55 | 44% |
| Signature | €159 | €88 | 45% |
| Empire | €249 | €138 | 45% |

### Fonte 3: AdminDashboard.tsx (calcolo MRR)
| Piano | Prezzo usato per MRR |
|-------|---------------------|
| Starter | €29 |
| Pro | €79 |
| Signature | €149 |
| Empire | €299 |

### ❗ Azione Richiesta
Scegliere **UNA sola fonte di verità** (raccomandato: il Database) e aggiornare:
1. `FounderLanding.tsx` → leggere prezzi da `subscription_plans` DB
2. `AdminDashboard.tsx` → calcolare MRR dai dati reali DB
3. Eliminare tutti i prezzi hardcoded nel codice

---

## 📐 Modello Founder (Strategia)

### Come Funziona
1. **25 posti** (UI) / **100 posti** (DB) — ⚠️ DECIDERE QUALE
2. Prezzo bloccato **per sempre** (lock-in emotivo)
3. Badge "Founding Member" visibile nel gestionale (status symbol)
4. Onboarding personale 1:1 con Michael
5. Accesso anticipato a tutte le feature future
6. Canale WhatsApp diretto con il founder

### Psicologia del Pricing Founder
- **Scarsità reale**: i posti sono limitati (countdown live)
- **Urgency**: countdown timer + exit intent popup
- **Social proof**: "22 Founder già dentro" + activity feed live
- **Loss aversion**: "Se non agisci, torni al prezzo pubblico"
- **Reciprocità**: "Michael ti fa l'onboarding personalmente"

### Trial Period
- Nella struttura dati esiste `trial_ends_at` e `trialEndsAt`
- **NON implementato nell'UI** attualmente
- Proposta: 14 giorni trial senza carta → upgrade o downgrade a Free

---

## 🎯 Path to €1M ARR

### Scenario: Solo Piani Founder (Worst Case)

| Utenti | Piano | MRR | ARR |
|--------|-------|-----|-----|
| 100 | Mix (avg €70/m) | €7.000 | €84.000 |
| 500 | Mix (avg €70/m) | €35.000 | €420.000 |
| 1.000 | Mix (avg €70/m) | €70.000 | €840.000 |
| **1.200** | **Mix (avg €70/m)** | **€84.000** | **€1.008.000** ✅ |

### Scenario: Mix Founder + Pubblico (Realistico)

| Mese | Founder | Pubblico | MRR Founder | MRR Pubblico | MRR Totale |
|------|---------|----------|-------------|--------------|------------|
| 1-3 | 25 | 0 | €1.750 | €0 | €1.750 |
| 4-6 | 25 | 50 | €1.750 | €5.950 | €7.700 |
| 7-12 | 25 | 200 | €1.750 | €23.800 | €25.550 |
| 13-18 | 25 | 500 | €1.750 | €59.500 | €61.250 |
| 19-24 | 25 | 800 | €1.750 | €95.200 | **€96.950** |

> Con 825 utenti paganti (avg €117/m pubblico) → **€1.16M ARR** al mese 24 ✅

### KPI da Monitorare

| KPI | Target | Formula |
|-----|--------|---------|
| MRR | Track weekly | Σ (utenti × prezzo piano) |
| ARPU | €80-120/m | MRR / utenti paganti |
| Churn | <5%/mese | Cancellazioni / utenti attivi |
| LTV | >€1.200 | ARPU / churn rate |
| CAC | <€100 | Costo acquisizione / nuovi utenti |
| LTV:CAC | >12:1 | LTV / CAC |

---

## 💡 Upsell / Cross-sell Futuri

| Prodotto | Prezzo | Target |
|----------|--------|--------|
| Luminel Academy (corsi business) | €497 one-time | Tutti |
| White-label setup fee | €299 one-time | Empire |
| Custom integrations | €99-499 | Signature/Empire |
| Add-on: Inventory management | €19/m | Pro+ |
| Add-on: Email marketing (Resend) | €29/m | Pro+ |
| Referral program rewards | €50/referral | Tutti |
