-- ============================================================
-- LUMINEL MANAGER — Bucket privato per documenti cliente
-- Da eseguire DOPO 00_SETUP_CONSOLIDATO.sql
-- Motivo: i documenti cliente (contratti, moduli intake, note)
-- non devono MAI essere su un bucket pubblico come 'resources'.
-- Qui usiamo signed URL a tempo, non URL pubblici permanenti.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Solo il coach proprietario può caricare/leggere/eliminare i documenti
-- dei SUOI clienti. Path atteso: {coach_id}/{client_id}/{filename}
CREATE POLICY "client_docs_owner_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "client_docs_owner_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "client_docs_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Nessuna policy "public read" qui: a differenza di logos/avatars/resources,
-- questo bucket non deve mai esporre URL pubblici permanenti.

SELECT 'Bucket client-documents creato, privato, pronto per signed URL.' AS status;
