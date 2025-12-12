-- Create API keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create API keys (no login required)
CREATE POLICY "Anyone can create API keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read their own API key by value
CREATE POLICY "Anyone can verify API keys" 
ON public.api_keys 
FOR SELECT 
USING (true);