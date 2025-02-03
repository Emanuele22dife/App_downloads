-- Rimuovi le policies esistenti per il bucket 'autorizzazioni'
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Crea nuove policies per il bucket 'autorizzazioni'
CREATE POLICY "Allow authenticated users to manage files"
ON storage.objects FOR ALL
USING (bucket_id = 'autorizzazioni' AND auth.role() = 'authenticated');

