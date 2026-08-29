# 🛠️ 13 — Brief Esecutivo per Antigravity

> **Da**: Direttore (audit completo del 28 agosto 2026)
> **A**: Antigravity / assistente di coding
> **Obiettivo**: portare Luminel Manager da "prodotto costruito" a "prodotto lanciabile in sicurezza"
> **Regola**: eseguire nell'ordine delle fasi. Non saltare avanti — ogni fase dipende dalla precedente.

## ⚠️ STATO AGGIORNATO — leggi prima di iniziare

- **FASE 0**: ✅ **COMPLETATA E VERIFICATA** — `00_SETUP_CONSOLIDATO.sql` eseguito sul nuovo Supabase, RLS confermato via `diagnostica_sicurezza.sql`, account admin attivo con `is_admin = true`. Non toccare il database, non rieseguire migration.
- **FASE 1, punti 1.1-1.5, 1.8**: ✅ **GIÀ FATTI** — vedi dettaglio sotto. File corretti e allegati: `config.ts`, `App.tsx`, `contexts/UserContext.tsx`, `components/Layout.tsx`, `components/FounderLanding.tsx`, `components/HomeLanding.tsx`, `components/AdminDashboard.tsx`, `components/Clients.tsx`, `services/pricingPlans.ts` (nuovo), `services/storageService.ts`, `database/01_CLIENT_DOCUMENTS_BUCKET.sql` (nuovo). **Non modificarli di nuovo** — proponi modifiche invece di sovrascrivere.
- **FASE 1, punto 1.6 (countdown)**: ✅ falso allarme — nessuna azione richiesta.
- **NUOVA — FASE 4**: pricing condiviso, persistenza profilo/documenti — vedi sezione dedicata sotto.
- **Da qui si riparte**: FASE 1 punto 1.7/1.9 (minori), FASE 2, FASE 4 punti ancora aperti, poi FASE 3.

---

## FASE 0 — Database (bloccante, fare per primo)

### 0.1 Eseguire il setup consolidato sul nuovo server Supabase ✅ FATTO
- **File**: `database/00_SETUP_CONSOLIDATO.sql`
- **Stato**: eseguito e verificato il 28 agosto 2026 — RLS confermato via `diagnostica_sicurezza.sql` (zero tabelle scoperte, zero funzioni DEFINER inattese)

### 0.2 Archiviare le migration vecchie, non cancellarle — ⬜ ANCORA DA FARE
- **File**: tutti i 15 file in `database/migration_*.sql` + `schema.sql`
- **Azione**: spostarli in `database/archivio_pre_28ago2026/` con un `README.md` che dice "superate da 00_SETUP_CONSOLIDATO.sql, mantenute solo per storico"
- **Criterio di accettazione**: `database/` root contiene solo `00_SETUP_CONSOLIDATO.sql`, `diagnostica_sicurezza.sql`, e la cartella archivio

### 0.3 Impostare l'admin reale ✅ FATTO
- **Stato**: `is_admin = true` confermato su `jaramichael@hotmail.com` via query diretta

---

## FASE 1 — Sicurezza Frontend (bloccante)

### 1.1 `config.ts` ✅ FATTO — file allegato, non ritoccare
- **Fix applicato**: nessun fallback hardcoded su admin email/WhatsApp/Calendar. Le variabili leggono solo da `import.meta.env`; se mancano, esposti helper `isWhatsAppConfigured()` / `isCalendarConfigured()` per mostrare uno stato "in configurazione" nell'UI invece di un placeholder finto

### 1.2 `App.tsx` + `contexts/UserContext.tsx` ✅ FATTO — file allegati, non ritoccare
- **Fix applicato**: `AdminRoute` ora controlla `user.isAdmin`, popolato da una query reale a `public.users.is_admin` (protetta da RLS) invece di confrontare l'email con una costante hardcoded

### 1.3 `components/FounderLanding.tsx` ✅ FATTO — file allegato, non ritoccare
- **Fix applicato**: stato `plans` inizializzato a `null` invece che ai prezzi hardcoded. Se la fetch DB fallisce o torna vuota, la UI mostra "caricamento in corso" o un errore esplicito — mai più un prezzo sbagliato mostrato a un cliente. Corretto anche il copyright "© 2025" → "© 2026"

### 1.4 `components/HomeLanding.tsx` ✅ FATTO — file allegato, non ritoccare
- **Nota**: il conteggio posti Founder chiamava già `get_founder_spots_remaining()` correttamente — non era hardcoded come sembrava dai vecchi documenti. Il vero problema era lo stesso di 1.3: l'array prezzi (`TIER_PLANS`) usato come fallback silenzioso. Stesso fix applicato: nessun prezzo finto, mai

### 1.5 `AdminDashboard.tsx` ✅ FATTO — file allegato, non ritoccare
- **Fix applicato**: `tierPricing` non parte più da fallback hardcoded — se la fetch DB fallisce, banner d'errore esplicito, MRR mostra "dato non disponibile" invece di calcolare su numeri vecchi

### 1.6 Countdown Founder — ✅ FALSO ALLARME, nessuna azione
- Calcola già da `APP_CONFIG.founderDeadline`, non è hardcoded

### 1.7 Bug pre-esistenti trovati per caso durante il controllo tipi — ⬜ DA VALUTARE
- **File**: `components/Clients.tsx`
- **Problema**: chiama tre funzioni mai definite nel file — `syncTask`, `sendPromo`, `triggerFullSync`. Se un utente clicca i bottoni collegati, l'app va in errore a runtime
- **Fix**: trovare le funzioni previste (probabilmente rinominate o mai completate) e ricollegarle, o rimuovere i bottoni se la feature non è pronta
- **Stato (28 ago)**: bottoni disabilitati con badge "Presto disponibile" — approvato, buona soluzione temporanea

### 1.8 🔴 CRITICO — Goals, Note, Task e Documenti in Clients.tsx non vengono mai salvati su Supabase
- **File**: `components/Clients.tsx`
- **Problema**: `handleAddTask`, `handleSaveGoal`, `handleSaveNote`, `handleFileChange` aggiornano solo `setSelectedClient`/`setClients` (stato React locale). Nessuna chiamata a `clientService.updateClient()` o equivalente. Al primo refresh della pagina, tutto ciò che un coach ha aggiunto tramite queste 4 funzioni sparisce senza alcun errore visibile
- **Aggravante documenti**: `handleFileChange` usa `URL.createObjectURL(file)` — non carica nulla su Supabase Storage (che esiste già come `storageService.ts`), quindi il file non è mai davvero salvato, nemmeno temporaneamente lato server
- **Perché è più urgente dei bottoni orfani**: qui l'interfaccia sembra funzionare perfettamente — zero segnali visivi che il salvataggio stia fallendo. Con clienti reali che affidano note, obiettivi e documenti, è un rischio di fiducia diretto
- **Fix richiesto**: dopo ogni mutazione locale in queste 4 funzioni, chiamare `clientService.updateClient(selectedClient.id, { tasks/goals/sessionNotes/documents: ... })` per persistere davvero. Per `handleFileChange`, integrare `storageService.ts` per l'upload reale su Supabase Storage prima di generare l'URL da salvare
- **Accettazione**: aggiungere un task/goal/nota/documento, ricaricare la pagina (F5), verificare che sia ancora presente

### 1.8 ✅ FATTO — Goals, Note, Task e Documenti in Clients.tsx ora persistono davvero
- **Fix applicato**: le 4 funzioni ora chiamano `clientService.updateClient()` con solo il campo cambiato (non l'oggetto intero, per evitare race condition su modifiche rapide). Documenti caricati su bucket privato dedicato (vedi Fase 4)
- **Verificato**: build TypeScript pulita

### 1.9 Cleanup minore — dati mock con nomi di celebrità
- **File**: `components/Clients.tsx`
- **Problema**: `mockClientsData` in cima al file contiene clienti finti con nomi di celebrità reali (Sophia Loren, James Bond) — non risulta usato nel render attuale (dead code), ma se mai riattivato per errore mostrerebbe questi nomi a un cliente vero
- **Fix**: rimuovere l'array se non è più necessario, o sostituire i nomi con placeholder generici
- **Priorità**: bassa, non bloccante

---

## FASE 4 — Pricing Condiviso & Persistenza Profilo (nuova, 28 ago sera)

### 4.1 ✅ FATTO — `services/pricingPlans.ts` (nuovo file)
- Fonte unica per prezzi + storytelling ("per chi è", "cosa risolve", differenziazione) usata da `FounderLanding.tsx` e `HomeLanding.tsx`
- **Bug corretto**: il merge con i prezzi DB confrontava `dbPlan.id` (UUID) con `staticPlan.id` (stringa 'starter'/'pro'/...) — non trovava mai corrispondenza. Ora confronta correttamente su `dbPlan.name`
- Include `getDiscountPercent()` — sconto calcolato dai prezzi reali, mai un numero scritto a mano

### 4.2 ✅ FATTO — `FounderLanding.tsx` e `HomeLanding.tsx` collegati davvero al file condiviso
- Prima: `FounderLanding.tsx` aveva un riferimento rotto (`PRICING_PLANS` inesistente, causava errore silenzioso), `HomeLanding.tsx` ignorava il file condiviso e usava una `TIER_PLANS` locale propria
- **Nota importante**: in `FounderLanding.tsx` ho rimosso le statistiche social-proof simulate (live viewers, "847+ professionisti", activity feed, video con foto stock) — **decisione ancora da confermare dal founder**, non riaggiungerle senza chiedere
- **Nota importante**: in `HomeLanding.tsx` NON ho toccato contenuti marketing — inclusa la sezione Testimonials (Marco/Sara/Giulia) e la citazione "Fonte: Report ISTAT Wellness Industry 2024" (da verificare se è una fonte reale prima del lancio)

### 4.3 ✅ FATTO — Documenti cliente su bucket privato
- **File nuovi**: `database/01_CLIENT_DOCUMENTS_BUCKET.sql`, funzioni aggiunte a `services/storageService.ts` (`uploadClientDocument`, `getSignedDocumentUrl`)
- **Motivo**: i documenti cliente (contratti, moduli intake) finivano nel bucket `resources`, pubblico by design — chiunque con l'URL poteva aprirli, nessuna autenticazione. Ora bucket dedicato privato, accesso via signed URL a tempo (1 ora)

### 4.4 ✅ FATTO — `UserContext.tsx` + `Layout.tsx`: profilo non si salvava mai davvero
- **Problema trovato**: `updateProfile()` aveva un `// TODO: Sync to Supabase` mai completato — scriveva solo su `localStorage`, che in modalità cloud non veniva mai riletto. Ogni modifica al modal "Edit Profile" spariva al primo refresh
- **Problema aggiuntivo**: il modal aveva una sezione "Dati Aziendali" (companyName/companyAddress/vatId) duplicata con la pagina Impostazioni (`user_settings`, funzionante) — stessi dati, due posti diversi, mai sincronizzati
- **Fix applicato**: `updateProfile()` ora scrive su `public.users` (full_name, phone, avatar_url); modal ridotto ai soli dati personali; sezione aziendale rimossa dal modal (resta solo in Impostazioni)

### 4.5 ⬜ ANCORA APERTO — bucket `resources` (libreria risorse del coach) resta pubblico
- **Decisione del founder ancora attesa**: se i contenuti della libreria risorse (audio/PDF/video che il coach condivide) debbano restare pubblici by design (condivisibili facilmente) o diventare privati/a pagamento come i documenti cliente

### 4.6 ⬜ ANCORA APERTO — contatore posti Founder per categoria professionale
- Serve se si vuole mostrare "12 posti rimasti per Coach" / "9 per Operatori Olistici" in modo reale nella sezione categorie della landing — oggi il conteggio è solo totale, non diviso per `business_type`. Richiede una query nuova, non ancora scritta

---

## FASE 2 — Coerenza & Pulizia (prima del lancio pubblico)

### 2.1 Copyright anno
- **File**: `FounderLanding.tsx` riga ~1240 — "© 2025" → "© 2026"

### 2.2 File doppioni da rimuovere dalla cartella attiva
- `components/HomeLanding.backup.tsx`
- `components/HomeLanding.piani_fixed.tsx`
- **Azione**: spostarli fuori da `components/` (es. in `_archive/`) così nessuno li edita per errore pensando siano la versione live

### 2.3 Stripe da TEST a LIVE
- **File**: `stripePrices.ts`
- **Nota**: questo è uno step manuale su dashboard Stripe (creare prodotti/price live), non solo codice — Antigravity può preparare il codice ma le chiavi/price ID li generi tu su Stripe

---

## FASE 3 — VirtualTwin (pagina separata, ma stesso principio: niente numeri falsi)

### 3.1 Contatore "posti occupati" nell'hero
- **Problema**: banner in alto mostra "0/20 Posti Genesis Occupati" mentre la sezione prezzi più sotto mostra Genesis ed Pioneer già "Esaurite"
- **Fix**: un'unica fonte per lo stato delle wave, usata sia nell'hero che nella tabella prezzi

### 3.2 "847+ Founder" vs "60 posti totali"
- **Problema**: numero di founder dichiarato supera il numero massimo di posti mai disponibili
- **Fix**: chiarire se è un numero riferito a tutto l'ecosistema Insolito (e dirlo esplicitamente nel testo) o correggerlo a un numero coerente con i 60 posti reali

### 3.3 Countdown "Genesis €147" quando Genesis è già chiuso
- **Fix**: il countdown deve riferirsi sempre alla wave attualmente attiva (oggi: Elite, €247), non a una wave già esaurita

### 3.4 Date "prossimi aumenti" già passate
- **Problema**: Aprile e Luglio 2026 mostrate come date future quando sono già passate (oggi 28 agosto 2026)
- **Fix**: date calcolate dinamicamente o quantomeno riviste manualmente ogni mese finché non c'è automazione

### 3.5 Claim statistici senza fonte
- **Problema**: "72% di perdita di opportunità", "-65% valore del brand", "+300% Produttività Digitale" presentati come dati
- **Fix**: o si cita una fonte reale, o si riformulano come opinione/promessa ("puoi recuperare fino a...") non come statistica misurata

### 3.6 Tier "Sovereignty" con equity/profit-share
- **Problema**: offerta di partnership societaria mentre "P.IVA in fase di costituzione"
- **Fix**: rimuovere o marcare chiaramente come "disponibile dopo costituzione società, su application" finché l'entità legale non esiste

---

## FASE 5 — Edge Functions & Dominio (nuova, 29 ago)

### 5.1 ✅ FATTO — Fix codice Edge Functions
- **File**: `supabase/functions/stripe-webhook/index.ts`, `supabase/functions/send-resource/index.ts`
- **Fix applicato**: URL di registrazione letto da secret `APP_URL` (era hardcoded su `app.luminelcoach.com`, dominio mai attivato — link morto nell'email di benvenuto). Mittente email di `send-resource` letto da secret `FROM_EMAIL` condiviso con `send-email` (era hardcoded su `onboarding@resend.dev`)
- **Segnalato ma non corretto**: nessun controllo sul tetto 25 posti Founder dentro il webhook — chi paga tramite Payment Link diretto diventa Founder senza verifica. Price ID in `PRICE_TO_TIER` sono di Stripe TEST — vanno aggiornati al passaggio a LIVE

### 5.2 🔴 BLOCCO REALE — Resend in sandbox, email non arrivano a clienti veri
- **Stato**: confermato dal founder il 29 agosto — nessun dominio verificato su Resend
- **Conseguenza**: `send-email` e `send-resource` funzionano SOLO verso l'email dell'account Resend stesso, non verso clienti reali, finché un dominio vero non viene verificato (richiede DNS)
- **Blocca**: l'intero flusso paga→email di benvenuto→registrazione per clienti reali, indipendentemente da Stripe LIVE o altro
- **Dipendenza**: serve un dominio vero posseduto dal founder (non un sottodominio Vercel condiviso) — verificare se già acquistato (es. Hostinger, menzionato come parte dello stack target) o ancora da comprare
- **Non è un task di codice**: è un passaggio business/infrastrutturale, in attesa di risposta

### 5.3 ⬜ Domande aperte
- Dominio vero: già posseduto o da acquistare?
- `AdminDashboard.tsx` ha ancora `luminel-manager.vercel.app` hardcoded nel pulsante "invia reminder" — stessa famiglia di problema, da allineare a `APP_URL` una volta deciso il dominio definitivo

---

## Ordine di esecuzione consigliato
FASE 0 (oggi) → FASE 1 (questa settimana, blocca tutto il resto) → FASE 2 (prima di mandare traffico) → FASE 3 (prima di riattivare la Elite Wave)
