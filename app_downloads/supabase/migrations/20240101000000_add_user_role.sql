-- Aggiungi la colonna role alla tabella users
ALTER TABLE public.users ADD COLUMN role TEXT NOT NULL DEFAULT 'standard';

-- Crea un tipo enum per i ruoli
CREATE TYPE user_role AS ENUM ('admin', 'standard');

-- Modifica la colonna role per utilizzare il tipo enum
ALTER TABLE public.users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Aggiungi un vincolo di controllo per assicurarsi che il ruolo sia valido
ALTER TABLE public.users ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'standard'));

