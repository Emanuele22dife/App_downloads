-- Rimuovi le policies esistenti per la tabella 'folders'
DROP POLICY IF EXISTS "Enable read access for all users" ON public.folders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.folders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.folders;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.folders;

-- Crea nuove policies per la tabella 'folders'
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

