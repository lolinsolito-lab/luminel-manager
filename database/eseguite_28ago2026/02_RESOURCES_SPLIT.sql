-- ============================================================
-- LUMINEL MANAGER — Risorse: pubbliche (assaggio/FOMO) vs private
-- Da eseguire DOPO 00_SETUP_CONSOLIDATO.sql e 01_CLIENT_DOCUMENTS_BUCKET.sql
-- ============================================================

-- 1) Colonna per marcare quali risorse sono assaggi gratuiti pubblici
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_free_sample BOOLEAN DEFAULT false;

COMMENT ON COLUMN resources.is_free_sample IS
  'true = assaggio gratuito, visibile pubblicamente per creare FOMO. false (default) = contenuto vero, riservato ai clienti del coach, bucket privato.';

-- 2) Nuovo bucket privato per le risorse vere (non gli assaggi)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources-private', 'resources-private', false)
ON CONFLICT (id) DO NOTHING;

-- Solo il coach proprietario può caricare/leggere/eliminare le proprie risorse
-- private. Path atteso: {coach_id}/{filename}
CREATE POLICY "resources_private_owner_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resources_private_owner_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resources-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "resources_private_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resources-private' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Nota: il bucket 'resources' originale (pubblico) resta per gli assaggi
-- gratuiti — nessuna modifica lì, è pubblico by design per quello scopo.

SELECT 'Bucket resources-private creato. Colonna is_free_sample aggiunta a resources.' AS status;
