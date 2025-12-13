import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const generateShortCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 11) + 1;
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const apiKey = req.headers.get("x-api-key");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key required. Add x-api-key header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify API key exists
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("id")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (keyError || !keyData) {
      console.log("Invalid API key:", apiKey);
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url, customCode } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let shortCode = customCode || generateShortCode();

    // Check if custom code already exists
    if (customCode) {
      const { data: existing } = await supabase
        .from("shortened_urls")
        .select("id")
        .eq("short_code", customCode)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: "Custom code already in use" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const expireAt = new Date();
    expireAt.setMonth(expireAt.getMonth() + 1);

    const { data, error } = await supabase
      .from("shortened_urls")
      .insert({
        short_code: shortCode,
        original_url: url,
        user_id: `api_${keyData.id}`,
        expire_at: expireAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create shortened URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = req.headers.get("origin") || "https://urlgpt.lovable.app";
    
    return new Response(
      JSON.stringify({
        shortUrl: `${baseUrl}/${data.short_code}`,
        shortCode: data.short_code,
        originalUrl: data.original_url,
        expiresAt: data.expire_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in shorten function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
