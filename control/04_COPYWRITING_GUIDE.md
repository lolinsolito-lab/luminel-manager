# ✍️ 04 — Copywriting Guide

> **Responsabile**: Copywriter  
> **Ultimo aggiornamento**: 17 Giugno 2026  
> **Status**: ✅ Framework definito — Rivedere ad ogni nuova pagina

---

## 📖 Framework: StoryBrand (Donald Miller)

Luminel usa il framework **StoryBrand** su TUTTE le pagine di vendita.

### I 7 Elementi

| # | Elemento | Luminel |
|---|----------|--------|
| 1 | **L'Eroe** | Il professionista del benessere (NON Luminel) |
| 2 | **Il Problema** | Spreca 4h/giorno in gestionale, Excel, WhatsApp |
| 3 | **La Guida** | Michael Jara / Luminel (chi ha già risolto il problema) |
| 4 | **Il Piano** | 3 step: Iscriviti → Setup in 47min → Gestisci in 19min/giorno |
| 5 | **L'Azione** | "Reclama il tuo Posto Founder" / "Scegli il Piano" |
| 6 | **Il Successo** | Dashboard pulita, tempo libero, +revenue, serenità |
| 7 | **Il Fallimento** | Tra 6 mesi: stessi Excel. Tra 1 anno: burnout. Tra 2 anni: chiudi. |

---

## 🎙️ Tono di Voce

### Principi Fondamentali

| Principio | Esempio ✅ | Contro-esempio ❌ |
|-----------|-----------|-------------------|
| **Diretto** | "Basta Excel." | "Consideriamo alternative al foglio di calcolo" |
| **Empatico** | "Ci siamo passati." | "I professionisti dovrebbero..." |
| **Premium** | "Il tuo impero merita di meglio" | "Un buon gestionale per tutti" |
| **Urgente** | "3 posti rimasti" | "Iscriviti quando vuoi" |
| **Italiano** | "Ragione Sociale / Studio" | "Company Name" |
| **Esclusivo** | "25 visionari" | "Utenti" |

### Parole Chiave da Usare SEMPRE

```
✅ USA:
- Empire / Impero
- Founder / Founding Member
- Premium / Élite / Esclusivo
- Visionari / Pionieri
- Professionale / Prestige
- "Elevato" / "Superiore"
- "Crafted" / "Costruito"
- "Il tuo business"
- "In 47 minuti" / "In 19 minuti al giorno"
```

### Parole da NON Usare Mai

```
❌ EVITA:
- "Gratis" (anche per il tier free — usa "Piano Prova")
- "Economico" / "Risparmia" (usa "Investimento")
- "Facile" (usa "Intuitivo" o "Immediato")
- "Tool" / "Software" (usa "Gestionale" o "Piattaforma")
- "Users" (usa "Professionisti" o "Founder")
- "Cheap" / "Budget"
- "Beta" (usa "Early Access")
- "Bug" (usa "Miglioramento in corso")
```

---

## 📝 Testi Chiave (Source of Truth)

### Hero Landing (`/`)
> **Headline**: "Il Gestionale che i professionisti del benessere **meritano**."  
> **Sub**: "Basta Excel. Basta WhatsApp caotici. Basta 5 tool diversi. Luminel unifica tutto in un'unica piattaforma premium — in 47 minuti di setup."  
> **CTA**: "Diventa Founding Member →"

### Founder Page (`/founder`)
> **Headline**: "I primi 25 Founding Member ottengono il -44% per sempre."  
> **Sub**: "Non è uno sconto. È un'alleanza. Prezzo bloccato a vita. Onboarding personale con Michael. Accesso a feature esclusive."  
> **CTA**: "Scegli {Piano} →" / "ENTRA NELLA WAITLIST →"

### Login Page
> **Headline**: "Bentornato"  
> **Sub**: "Il tuo business, Elevato."

### Dashboard (Header)
> Mostra titolo pagina + badge Founding Member + badge Tier

---

## 🔢 Numeri da Citare (verificati dal codice)

| Numero | Contesto | Fonte |
|--------|----------|-------|
| **47 minuti** | Tempo di setup | StoryBrand |
| **19 minuti/giorno** | Tempo gestione quotidiano | StoryBrand |
| **25 posti** Founder | Posti totali Founder (UI) | FounderLanding |
| **100 posti** Founder | Posti totali (DB) | `migration_v2.0` |
| **44%** | Sconto Founder | FounderLanding |
| **92%** | Professionisti che perdono tempo | StoryBrand |
| **127** | Professionisti intervistati | StoryBrand |
| **€180K** | Revenue personale Michael 2022 | StoryBrand |
| **11 mesi** | Tempo di sviluppo | StoryBrand |
| **847 ore** | Ore di coding | StoryBrand |
| **€47K** | Investimento nello sviluppo | StoryBrand |
| **847+** | "Professionisti in lista" (dal FounderLanding) | UI simulato |

> ⚠️ **ATTENZIONE**: I numeri 25 vs 100 posti Founder sono incoerenti. Il DB dice 100, l'UI dice 25. Decidere UNO e aggiornare.

---

## 📧 Template Email (Da Creare)

### Welcome Waitlist
> Oggetto: "Sei dentro, {nome}. Posizione #{posizione} nella Founder List 🏛️"

### Welcome Pagamento
> Oggetto: "Il tuo Impero è pronto. Ecco come iniziare in 47 minuti."

### Reminder No-Show
> Oggetto: "Hai un appuntamento tra 1 ora ⏰"

### Upgrade Prompt
> Oggetto: "Hai raggiunto il limite di {limite}. È il momento di scalare."

---

## ✅ Checklist Copywriter

Prima di pubblicare qualsiasi testo:

- [ ] L'eroe è il professionista, NON Luminel?
- [ ] C'è un elemento di urgency (posti, tempo, prezzo)?
- [ ] Il tono è premium, mai "cheap"?
- [ ] I numeri sono coerenti con questo documento?
- [ ] La CTA è chiara e con verbo d'azione?
- [ ] C'è il "failure path" (cosa succede se NON agisce)?
- [ ] Il testo parla italiano naturale, non traduzionese?
