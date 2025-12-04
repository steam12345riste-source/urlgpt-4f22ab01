-- Update default expire_at to 1 month instead of 24 hours
ALTER TABLE public.shortened_urls 
ALTER COLUMN expire_at SET DEFAULT (now() + interval '1 month');