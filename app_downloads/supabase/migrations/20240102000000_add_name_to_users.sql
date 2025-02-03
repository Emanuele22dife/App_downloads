-- Add 'name' column to the 'users' table
ALTER TABLE public.users ADD COLUMN name TEXT;

-- Update existing rows to have a default name if needed
UPDATE public.users SET name = 'User ' || id WHERE name IS NULL;

-- Make the 'name' column NOT NULL after setting default values
ALTER TABLE public.users ALTER COLUMN name SET NOT NULL;

