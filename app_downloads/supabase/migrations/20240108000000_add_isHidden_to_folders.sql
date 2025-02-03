-- Aggiungi la colonna isHidden alla tabella folders
ALTER TABLE public.folders ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Aggiorna le policy per la tabella folders
DROP POLICY IF EXISTS "Enable full access for all users" ON public.folders;

-- Policy per consentire la lettura di tutte le cartelle agli utenti autenticati
CREATE POLICY "Allow read access for authenticated users" 
ON public.folders FOR SELECT 
TO authenticated
USING (true);

-- Policy per consentire l'inserimento, l'aggiornamento e l'eliminazione solo agli utenti autenticati
CREATE POLICY "Allow insert, update, delete for authenticated users" 
ON public.folders FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy per consentire la lettura delle cartelle non nascoste a tutti gli utenti
CREATE POLICY "Allow public read access for non-hidden folders" 
ON public.folders FOR SELECT 
TO anon
USING (NOT is_hidden);

