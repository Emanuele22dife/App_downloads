-- Rimuovi le policies esistenti per la tabella 'files'
DROP POLICY IF EXISTS "Enable read access for all users" ON public.files;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.files;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.files;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.files;

-- Crea nuove policies per la tabella 'files'
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

