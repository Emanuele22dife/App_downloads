-- Aggiorna le policies per la tabella 'files'
DROP POLICY IF EXISTS "Enable read access for all users" ON public.files;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.files;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.files;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.files;

CREATE POLICY "Enable full access for all users" 
ON public.files FOR ALL 
USING (true);

-- Aggiorna le policies per la tabella 'folders'
DROP POLICY IF EXISTS "Enable read access for all users" ON public.folders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.folders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.folders;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.folders;

CREATE POLICY "Enable full access for all users" 
ON public.folders FOR ALL 
USING (true);

