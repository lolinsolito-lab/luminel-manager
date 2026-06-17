# 🎨 01 — Brand Identity

> **Responsabile**: Brand Strategist  
> **Ultimo aggiornamento**: 17 Giugno 2026  
> **Status**: ✅ Definito — Da rivedere ogni quarter

---

## 👤 Personal Branding — Chi È Michael Jara

### L'Identità
- **Nome**: Michael Jara
- **Ruolo**: Founder & CEO di Luminel
- **Email admin**: jaramichael@hotmail.com
- **Origine**: Italia (Milano)
- **Archetipo**: Il **Creatore-Ribelle** — un professionista che ha vissuto il caos gestionale in prima persona e ha deciso di risolverlo da solo

### La Storia (Storytelling Core)
> Nel 2022 ho fatto €180K di revenue, ma lavoravo 73 ore a settimana.  
> Il problema non era trovare clienti. Era gestirli.  
> 4 ore/giorno su Excel e WhatsApp. Email perse. Pagamenti ritardati. Zero tempo per la famiglia.  
> Ho provato 8 gestionali — tutti costruiti per ristoranti, nessuno per professionisti come noi.  
> Una sera, ore 2:47AM, caffè #6: "Basta. Lo costruisco io."  
> **11 mesi. 847 ore di coding. €47K investiti.** Oggi gestisco 180 clienti con Luminel in 35 minuti al giorno.

### Credibilità / Proof Points
- 127 professionisti intervistati durante la ricerca di mercato
- 11 mesi di sviluppo
- 847 ore di coding
- €47K investiti nello sviluppo
- Il 92% dei professionisti intervistati passava più tempo sul gestionale che con i clienti

### Tono Personale di Michael
- Diretto, senza fronzoli ("Basta. Lo costruisco io.")
- Empatico (sa cosa vuol dire bruciare nel gestionale)
- Ambizioso ma accessibile ("Non sono un guru, sono uno che c'è passato")
- Italiano con spirito internazionale

---

## 🏛️ Brand Luminel

### Nome & Significato
- **Luminel** = "Luce" (Lumin-) + "-el" (suffisso elegante, divino)
- Evoca: illuminazione, chiarezza, elevazione
- Pronuncia: loo-mee-NEL

### Tagline
> **"Gestionale Premium per Professionisti"**

Alternative testate:
- "Il tuo business, Elevato."
- "Crafted for Empires"
- "Prestige & Excellence"

### Missione
> Restituire ai professionisti del benessere il **tempo** che il gestionale ruba ogni giorno, con uno strumento tanto bello quanto funzionale — un'esperienza che non devi mai subire, ma che **ami usare**.

### Visione
> Diventare il **gestionale #1 per professionisti del benessere** in Italia, poi in Europa. Non il più economico. Il più desiderabile.

### Valori del Brand

| Valore | Espressione nel Prodotto |
|--------|--------------------------|
| 🏛️ **Eccellenza** | UI premium, animazioni Framer Motion, design da luxury brand |
| ⏱️ **Efficienza** | Setup in 47 minuti, gestione in 19min/giorno |
| 🤝 **Empatia** | Costruito DA un professionista PER i professionisti |
| 🔒 **Fiducia** | RLS Supabase, crittografia, GDPR compliance |
| 🚀 **Innovazione** | AI Coach Gemini, WhatsApp automation, white-label |

---

## 🎨 Visual Identity

### Colori Primari

| Nome | HEX | Uso |
|------|-----|-----|
| **Luminel Gold** | `#C9A962` | CTA, badge, accent, brand color |
| **Dark Emperor** | `#1A1A1A` | Sfondi scuri, header, testi forti |
| **Ivory Canvas** | `#FDFCFA` | Sfondo landing page |
| **Stone** | Tailwind `stone-*` | Tutti i grigi neutri |

### Colori Secondari

| Nome | HEX | Uso |
|------|-----|-----|
| **Success Green** | `emerald-500` | Conferme, KPI positivi |
| **Alert Red** | `red-500` | Errori, pain points, urgency |
| **Empire Violet** | `violet-600` | Tier Empire, premium |
| **Warm Amber** | `amber-500` | Founder badge, countdown |

### Typography
- **Serif** (Headlines): Font serif del sistema — evoca lusso, tradizione
- **Sans-serif** (Body): Font sistema + `tracking-wide` — pulito, moderno
- **Mono** (Dati/Timer): `font-mono` — per countdown, prezzi, codici

### Stile UI
- **Border radius**: `rounded-2xl` / `rounded-3xl` / `rounded-[2rem]` — morbido, premium
- **Glass morphism**: `backdrop-blur`, `bg-white/80` sugli header
- **Shadows**: `shadow-lg shadow-amber-200/50` — ombre colorate e calde
- **Animazioni**: Framer Motion su ogni sezione — stagger children, spring physics
- **Skeleton loading**: Placeholder animati durante il caricamento

### Icone
- **Libreria**: `lucide-react`
- **Icona brand**: `Crown` (👑) — usata ovunque come simbolo Luminel
- **Icone tier**: Star (Starter), Zap (Pro), Crown (Signature), Building2 (Empire)

---

## 🚫 Cosa Luminel NON È

- ❌ NON è un gestionale generico (no ristoranti, no negozi)
- ❌ NON è economico (non competiamo sul prezzo)
- ❌ NON è "minimal MVP" (ogni pixel conta)
- ❌ NON è per tutti (è per professionisti che vogliono eccellenza)
- ❌ NON è complicato (setup in 47 minuti, non 4 giorni)
- ❌ NON parla "tech" (parla il linguaggio del professionista)

---

## ✅ Checklist Coerenza Brand

Prima di ogni release, verificare:

- [ ] I colori seguono la palette Gold/Dark/Stone?
- [ ] Le animazioni sono fluide e non eccessive?
- [ ] I testi parlano al professionista, non al developer?
- [ ] L'icona Crown è usata nei punti chiave?
- [ ] I bordi sono arrotondati (min `rounded-xl`)?
- [ ] Le CTA hanno il gradiente gold?
- [ ] Il footer dice "Made in Italia"?
- [ ] I numeri Founder sono aggiornati?
