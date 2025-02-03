-- Add 'date' and 'description' columns to the 'folders' table
ALTER TABLE public.folders 
ADD COLUMN date DATE,
ADD COLUMN description TEXT;

-- Update existing rows to have a default date if needed
UPDATE public.folders SET date = CURRENT_DATE WHERE date IS NULL;

-- Make the 'date' column NOT NULL after setting default values
ALTER TABLE public.folders ALTER COLUMN date SET NOT NULL;

