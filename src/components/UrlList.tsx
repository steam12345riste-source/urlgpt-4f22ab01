import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Trash2 } from "lucide-react";

interface ShortenedUrl {
  id: string;
  short_code: string;
  original_url: string;
  created_at: string;
  expire_at: string;
}

interface UrlListProps {
  refresh: number;
  onCountChange: (count: number) => void;
  onCustomCodeCheck: (hasCustomCode: boolean) => void;
}

export const UrlList = ({ refresh, onCountChange, onCustomCodeCheck }: UrlListProps) => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const { toast } = useToast();

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [refresh]);

  const fetchUrls = async () => {
    try {
      const userId = localStorage.getItem("urlgpt_user_id");
      if (!userId) {
        setUrls([]);
        onCountChange(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("shortened_urls")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(11);

      if (error) throw error;

      setUrls(data || []);
      onCountChange(data?.length || 0);
      
      // Check if user has any custom codes (codes that aren't 6 characters long)
      const hasCustom = data?.some(url => url.short_code.length !== 6) || false;
      onCustomCodeCheck(hasCustom);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast({
        title: "Error",
        description: "Failed to load URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expireAt: string) => {
    const expirationTime = new Date(expireAt).getTime();
    const now = new Date().getTime();
    const diff = expirationTime - now;

    if (diff <= 0) {
      return { expired: true, display: "Expired" };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      expired: false,
      display: `${hours}h ${minutes}m ${seconds}s`,
    };
  };

  const copyToClipboard = (shortCode: string) => {
    const shortUrl = `https://urlgpt.lovable.app/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    });
  };

  const deleteUrl = async (id: string) => {
    try {
      const { error } = await supabase.from("shortened_urls").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "URL removed successfully",
      });

      fetchUrls();
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast({
        title: "Error",
        description: "Failed to delete URL",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  if (urls.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No shortened URLs yet. Create your first one above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {urls.map((url) => {
        const timeRemaining = getTimeRemaining(url.expire_at);
        return (
          <div
            key={url.id}
            className={`flex items-center gap-3 p-4 bg-secondary rounded-lg border transition-colors ${
              timeRemaining.expired
                ? "border-destructive/50 opacity-60"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <code className={`font-mono text-sm ${timeRemaining.expired ? "text-muted-foreground line-through" : "text-primary"}`}>
                  https://urlgpt.lovable.app/{url.short_code}
                </code>
              </div>
              <p className="text-xs text-muted-foreground truncate">{url.original_url}</p>
              <p className={`text-xs mt-1 ${timeRemaining.expired ? "text-destructive" : "text-primary"}`}>
                {timeRemaining.expired ? "⏰ Expired" : `⏰ Expires in: ${timeRemaining.display}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(url.short_code)}
                className="hover:bg-primary/10"
                disabled={timeRemaining.expired}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteUrl(url.id)}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
