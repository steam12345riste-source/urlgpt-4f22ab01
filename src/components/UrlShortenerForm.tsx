import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, Sparkles } from "lucide-react";

interface UrlShortenerFormProps {
  onUrlCreated: () => void;
}

const generateShortCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 11) + 1; // Random length between 1-11 characters
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const UrlShortenerForm = ({ onUrlCreated }: UrlShortenerFormProps) => {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const shortCode = customCode.trim() || generateShortCode();

      // Check if custom code already exists
      if (customCode.trim()) {
        const { data: existing } = await supabase
          .from("shortened_urls")
          .select("id")
          .eq("short_code", shortCode)
          .maybeSingle();

        if (existing) {
          toast({
            title: "Code Taken",
            description: "This custom code is already in use. Try another one.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const userId = localStorage.getItem("urlgpt_user_id") || crypto.randomUUID();
      localStorage.setItem("urlgpt_user_id", userId);

      const expireAt = new Date();
      expireAt.setMonth(expireAt.getMonth() + 1);

      const { error } = await supabase.from("shortened_urls").insert({
        short_code: shortCode,
        original_url: url,
        user_id: userId,
        expire_at: expireAt.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "URL shortened successfully!",
      });

      setUrl("");
      setCustomCode("");
      onUrlCreated();
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast({
        title: "Error",
        description: "Failed to shorten URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Input
          type="url"
          placeholder="Enter your long URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-secondary border-border"
          disabled={loading}
        />
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <Input
            type="text"
            placeholder="Custom code (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
            className="bg-secondary border-border"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          <Link className="w-4 h-4 mr-2" />
          Shorten
        </Button>
      </div>
    </form>
  );
};
