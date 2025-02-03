-- Add 'role' column to the 'users' table
ALTER TABLE public.users ADD COLUMN role TEXT;

-- Create an enum type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'standard');

-- Update the 'role' column to use the enum type
ALTER TABLE public.users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Set default role as 'standard' for existing users
UPDATE public.users SET role = 'standard' WHERE role IS NULL;

-- Make the 'role' column NOT NULL after setting default values
ALTER TABLE public.users ALTER COLUMN role SET NOT NULL;

-- Add a check constraint to ensure only valid roles are inserted
ALTER TABLE public.users ADD CONSTRAINT check_valid_role CHECK (role IN ('admin', 'standard'));

