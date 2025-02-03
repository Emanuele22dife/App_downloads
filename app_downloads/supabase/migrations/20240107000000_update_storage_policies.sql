-- Rimuovi tutte le policies esistenti per il bucket 'autorizzazioni'
DROP POLICY IF EXISTS "Allow authenticated users full access to autorizzazioni bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert into autorizzazioni bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update in autorizzazioni bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete from autorizzazioni bucket" ON storage.objects;

-- Crea nuove policies per consentire l'accesso pubblico al bucket 'autorizzazioni'
CREATE POLICY "Allow public access to autorizzazioni bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'autorizzazioni');

-- Policy per consentire l'inserimento di nuovi oggetti
CREATE POLICY "Allow public insert into autorizzazioni bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'autorizzazioni');

-- Policy per consentire l'aggiornamento degli oggetti esistenti
CREATE POLICY "Allow public update in autorizzazioni bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'autorizzazioni');

-- Policy per consentire l'eliminazione degli oggetti
CREATE POLICY "Allow public delete from autorizzazioni bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'autorizzazioni');

