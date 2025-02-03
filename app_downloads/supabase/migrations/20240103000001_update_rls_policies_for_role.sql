-- Update the policy for inserting users to include the 'role' column
DROP POLICY IF EXISTS "Users can insert themselves with standard role" ON public.users;
CREATE POLICY "Users can insert themselves with standard role" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id AND role = 'standard');

-- Update the policy for users to view and update their own profile
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.users;
CREATE POLICY "Users can view and update own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Update the policy for admins to view and update all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles" ON public.users
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
CREATE POLICY "Admins can update all profiles" ON public.users
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

