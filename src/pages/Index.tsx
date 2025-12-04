import { useState } from "react";
import { UrlShortenerForm } from "@/components/UrlShortenerForm";
import { UrlList } from "@/components/UrlList";
import { Link2 } from "lucide-react";

const Index = () => {
  const [refresh, setRefresh] = useState(0);
  const [urlCount, setUrlCount] = useState(0);

  const handleUrlCreated = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Link2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">URLGPT</h1>
          </div>
          <p className="text-muted-foreground">by Riste aka ExploitZ3r0</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <UrlShortenerForm onUrlCreated={handleUrlCreated} currentCount={urlCount} />
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Your Shortened URLs</h2>
            <UrlList refresh={refresh} onCountChange={setUrlCount} />
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Powered by Lovable Cloud
        </div>
      </div>
    </div>
  );
};

export default Index;
