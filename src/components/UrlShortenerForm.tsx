import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "lucide-react";

interface UrlShortenerFormProps {
  onUrlCreated: () => void;
  currentCount: number;
}

const generateShortCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const UrlShortenerForm = ({ onUrlCreated, currentCount }: UrlShortenerFormProps) => {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentCount >= 11) {
      toast({
        title: "Limit Reached",
        description: "Maximum of 11 shortened links. Delete some to create more.",
        variant: "destructive",
      });
      return;
    }

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
      let shortCode = customCode.trim();
      
      // Validate custom code if provided
      if (shortCode) {
        if (!/^[a-zA-Z0-9]+$/.test(shortCode)) {
          toast({
            title: "Invalid Code",
            description: "Custom code can only contain letters and numbers",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        if (shortCode.length < 2 || shortCode.length > 20) {
          toast({
            title: "Invalid Code",
            description: "Custom code must be between 2 and 20 characters",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Check if custom code already exists
        const { data: existing } = await supabase
          .from("shortened_urls")
          .select("short_code")
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
      } else {
        // Generate random code if no custom code provided
        shortCode = generateShortCode();
      }

      const userId = localStorage.getItem("urlgpt_user_id") || crypto.randomUUID();
      localStorage.setItem("urlgpt_user_id", userId);

      const { error } = await supabase.from("shortened_urls").insert({
        short_code: shortCode,
        original_url: url,
        user_id: userId,
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
      <div className="space-y-2">
        <Input
          type="url"
          placeholder="Enter your long URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-secondary border-border"
          disabled={loading}
        />
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Custom code (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="flex-1 bg-secondary border-border"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || currentCount >= 11}>
            <Link className="w-4 h-4 mr-2" />
            Shorten
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {currentCount}/11 links created
      </p>
    </form>
  );
};
