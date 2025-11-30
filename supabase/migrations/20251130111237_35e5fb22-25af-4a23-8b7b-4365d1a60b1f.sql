-- Add expire_at column to shortened_urls table
ALTER TABLE public.shortened_urls 
ADD COLUMN expire_at timestamp with time zone DEFAULT (now() + interval '24 hours');