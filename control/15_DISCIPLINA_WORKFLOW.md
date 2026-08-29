# 🛡️ 15 — Disciplina Workflow & Git

> **Responsabile**: Direttore (Tech Lead)
> **Data**: 29 Agosto 2026
> **Perché esiste**: stasera abbiamo perso ore a rincorrere file che tornavano a versioni vecchie (`pricingPlans.ts`, `HomeLanding.tsx`, `LandingV2.tsx`) perché Antigravity lavorava a volte dalla sua memoria di conversazione invece di rileggere il file vero sul disco. Questo documento esiste per non ripeterlo.

---

## 1️⃣ Perché ora, non dopo

Finché Luminel è un progetto in costruzione con aggiornamenti continui — e lo sarà ancora a lungo prima di essere "finito" — ogni sessione di lavoro rischia lo stesso problema di stasera. Più il progetto cresce, più costa caro un file che torna indietro senza preavviso. La disciplina qui sotto non è burocrazia: è quello che ci ha fatto perdere due ore stasera, reso sistematico.

---

## 2️⃣ Il ciclo di lavoro sicuro (segui questo ordine, sempre)

1. **Un solo strumento alla volta sullo stesso file.** Non editare `X.tsx` con Antigravity mentre nella stessa finestra temporale ne discuti una versione diversa con Claude. Chiudi un giro, salva, poi passi all'altro strumento.
2. **Prima di ogni modifica, istruisci esplicitamente a rileggere il file reale.** Non "modifica X" ma *"leggi X così com'è ora sul disco, poi modifica solo [la parte specifica]"*. Vale per Antigravity, vale anche quando torni da me dopo aver lavorato altrove.
3. **Testa in locale prima di considerare una modifica "fatta".** `npm run dev`, verifica con i tuoi occhi (screenshot se serve), mai fidarsi di un "dovrebbe funzionare".
4. **Committa subito dopo ogni verifica positiva.** Non a fine giornata, non "quando ho tempo" — appena un file è confermato buono. Il commit è il checkpoint che ti permette di tornare indietro in un secondo se qualcosa si rompe dopo.
5. **Push quando vuoi**, ma il salvataggio locale (commit) è quello che conta per la sicurezza immediata — non serve aspettare il push per essere protetti.

---

## 3️⃣ Comandi Git essenziali (in italiano semplice)

Se non l'hai già fatto una volta sola nel progetto:
```bash
git init
```

**Il ciclo che userai quasi sempre, ogni volta che un file è confermato buono:**
```bash
git add .
git commit -m "descrizione breve di cosa hai appena verificato"
```
Esempio: `git commit -m "LandingV2 con pricing collegato, verificato con screenshot"`

**Per vedere cosa è cambiato rispetto all'ultimo commit** (utilissimo quando sospetti che un file sia "tornato indietro"):
```bash
git diff nome_del_file.tsx
```

**Per vedere la storia dei commit:**
```bash
git log --oneline
```

**Per tornare a una versione precedente di UN file specifico** (se quello attuale è rotto):
```bash
git checkout HEAD -- nome_del_file.tsx
```

**Per il push** (quando vuoi salvare online, es. su GitHub):
```bash
git push
```

---

## 4️⃣ Come istruire Antigravity per ridurre il rischio

Template minimo da usare quando gli chiedi una modifica:

> "Prima leggi [nome file] così com'è **ora** sul disco — non usare quello che ricordi da prima. Poi modifica solo [la parte specifica richiesta], lasciando invariato il resto."

Se Antigravity ti restituisce un file, e tu **sai** di aver già corretto qualcosa che nel suo output risulta di nuovo sbagliato — fermati. È il segnale che ha lavorato dalla memoria, non dal disco. Non correggere a mano senza controllare: torna alla fonte (il mio ultimo file verificato, o `git diff`) prima di procedere.

---

## 5️⃣ Segnali d'allarme — quando sospettare una regressione

- Un bug che avevi già visto corretto ricompare identico
- Un file "sembra" giusto ma un comportamento che dovrebbe esserci (es. i prezzi che si aggiornano dal DB) non si vede
- Antigravity descrive una modifica che tu ricordi di aver già fatto tu stesso, in un altro momento

In ognuno di questi casi: `git diff` prima di tutto. Ti dice in due secondi se il file è davvero cambiato rispetto all'ultimo checkpoint buono, invece di doverlo rileggere riga per riga o rimandarmelo per un confronto manuale.

---

## 6️⃣ Checklist rapida a inizio/fine di ogni sessione

**All'inizio:**
- [ ] `git status` — controlla se ci sono modifiche non salvate da una sessione precedente
- [ ] Se sì, capisci se sono volute o un residuo prima di continuare

**Alla fine (o dopo ogni pezzo verificato funzionante):**
- [ ] Testato in locale con i tuoi occhi
- [ ] `git add . && git commit -m "..."` 
- [ ] Solo dopo, se vuoi, `git push`
