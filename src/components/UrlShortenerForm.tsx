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
  const length = Math.floor(Math.random() * 11) + 1; // Random length between 1-11 characters
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const UrlShortenerForm = ({ onUrlCreated, currentCount }: UrlShortenerFormProps) => {
  const [url, setUrl] = useState("");
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
      const shortCode = generateShortCode();

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
        <Button type="submit" disabled={loading || currentCount >= 11} className="w-full">
          <Link className="w-4 h-4 mr-2" />
          Shorten
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {currentCount}/11 links created
      </p>
    </form>
  );
};
