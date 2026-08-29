-- ============================================================
-- LUMINEL MANAGER — DIAGNOSTICA SICUREZZA DATABASE
-- Da incollare ed eseguire nel SQL Editor del TUO progetto Supabase
-- 100% SOLA LETTURA — non modifica né cancella nulla
-- ============================================================

-- 1) Tutte le tabelle in public + stato RLS (true = protetta, false = APERTA)
SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2) 🔴 CRITICO: tabelle SENZA RLS — chiunque con l'anon key le legge/scrive tutte
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;

-- 3) Tutte le policy esistenti, tabella per tabella
SELECT schemaname, tablename, policyname, permissive, roles,
       cmd AS operazione, qual AS condizione_using, with_check AS condizione_with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4) 🔴 CRITICO: tabelle con RLS attivo ma ZERO policy collegate
--    (con RLS on e nessuna policy, Postgres blocca tutto — sembra "sicuro" ma spesso rompe l'app
--     in modi che poi "si sistemano" allentando troppo la policy per fretta: da controllare a mano)
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' AND t.rowsecurity = true
GROUP BY t.tablename
HAVING COUNT(p.policyname) = 0;

-- 5) Funzioni SECURITY DEFINER — bypassano RLS by design, vanno riviste una per una
--    (qui devono starci SOLO join_founder_waitlist, get_founder_spots_remaining
--     e i futuri webhook handler — se ce ne sono altre non attese, indagare)
SELECT routine_name, routine_schema, security_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND security_type = 'DEFINER';

-- 6) Foreign key (coach_id, client_id, ecc.) senza indice
--    Con RLS ogni query filtra su questi campi: senza indice, lento e costoso a scala
SELECT tc.table_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name AND indexdef LIKE '%' || kcu.column_name || '%'
  );

-- 7) Estensioni installate (conferma che pgcrypto/uuid-ossp ci siano se lo schema le richiede)
SELECT extname, extversion FROM pg_extension;

-- ============================================================
-- COME LEGGERE I RISULTATI
-- Query 2 vuota   → ok, nessuna tabella scoperta
-- Query 2 con righe → 🔴 fix immediato, quelle tabelle sono leggibili/scrivibili da chiunque
-- Query 4 con righe → verificare a mano se è voluto (blocco totale) o dimenticanza
-- Query 5 → ogni funzione elencata ha accesso "da admin": deve essere lì per un motivo preciso
-- ============================================================
