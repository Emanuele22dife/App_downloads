-- Aggiorna le policies per la tabella 'files'
DROP POLICY IF EXISTS "Enable read access for all users" ON public.files;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.files;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.files;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.files;

CREATE POLICY "Enable read access for all users" 
ON public.files FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.files FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" 
ON public.files FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" 
ON public.files FOR DELETE 
USING (auth.role() = 'authenticated');

-- Aggiorna le policies per la tabella 'folders'
DROP POLICY IF EXISTS "Enable read access for all users" ON public.folders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.folders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.folders;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.folders;

CREATE POLICY "Enable read access for all users" 
ON public.folders FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.folders FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" 
ON public.folders FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" 
ON public.folders FOR DELETE 
USING (auth.role() = 'authenticated');

