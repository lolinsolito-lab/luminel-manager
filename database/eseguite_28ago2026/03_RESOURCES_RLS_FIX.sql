-- ============================================================
-- LUMINEL MANAGER — Correzione: visibilità risorse via RLS, non bucket
-- Da eseguire DOPO 00_SETUP_CONSOLIDATO.sql e 02_RESOURCES_SPLIT.sql
--
-- MOTIVO DELLA CORREZIONE: Library.tsx non carica file reali su Supabase
-- Storage — il coach incolla solo un URL esterno (Drive/Dropbox/link web).
-- Quindi il controllo di visibilità pubblico/privato deve avvenire sulla
-- RIGA della tabella resources (chi può leggerla), non sul bucket storage
-- (che oggi non ospita nulla per questo flusso). Il bucket 'resources-private'
-- creato in 02_RESOURCES_SPLIT.sql resta pronto per il futuro, se un giorno
-- aggiungerete upload file reale — oggi non serve per questo fix.
-- ============================================================

-- La policy attuale (da 00_SETUP_CONSOLIDATO.sql) è "solo il coach proprietario":
-- CREATE POLICY "resources_coach_only" ON resources FOR ALL USING (coach_id = auth.uid());
-- Questo blocca ANCHE le risorse marcate is_free_sample = true per chiunque
-- non sia il coach stesso — quindi un lead magnet pubblico non sarebbe
-- visibile a un visitatore anonimo del sito. Va corretto.

DROP POLICY IF EXISTS "resources_coach_only" ON resources;

-- SELECT: il coach vede sempre le proprie risorse; chiunque (anche anonimo)
-- vede quelle marcate come assaggio gratuito, di qualsiasi coach
CREATE POLICY "resources_select_own_or_free_sample" ON resources
  FOR SELECT
  USING (coach_id = auth.uid() OR is_free_sample = true);

-- INSERT/UPDATE/DELETE: solo il coach proprietario, sempre
CREATE POLICY "resources_insert_own" ON resources
  FOR INSERT WITH CHECK (coach_id = auth.uid());

CREATE POLICY "resources_update_own" ON resources
  FOR UPDATE USING (coach_id = auth.uid());

CREATE POLICY "resources_delete_own" ON resources
  FOR DELETE USING (coach_id = auth.uid());

SELECT 'RLS risorse corretta: assaggi gratuiti visibili pubblicamente, resto solo al coach proprietario.' AS status;
