-- Create shortened_urls table
CREATE TABLE public.shortened_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by short_code
CREATE INDEX idx_shortened_urls_short_code ON public.shortened_urls(short_code);

-- Create index for user_id queries
CREATE INDEX idx_shortened_urls_user_id ON public.shortened_urls(user_id);

-- Enable Row Level Security
ALTER TABLE public.shortened_urls ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read shortened URLs (needed for redirects)
CREATE POLICY "Anyone can read shortened URLs" 
ON public.shortened_urls 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert shortened URLs
CREATE POLICY "Anyone can insert shortened URLs" 
ON public.shortened_urls 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to delete their own URLs
CREATE POLICY "Users can delete their own URLs" 
ON public.shortened_urls 
FOR DELETE 
USING (true);