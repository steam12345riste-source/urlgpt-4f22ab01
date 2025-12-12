import { useState } from "react";
import { Link } from "react-router-dom";
import { UrlShortenerForm } from "@/components/UrlShortenerForm";
import { UrlList } from "@/components/UrlList";
import { TrustedBy } from "@/components/TrustedBy";
import { Link2, Zap, Shield, Globe, Code } from "lucide-react";

const Index = () => {
  const [refresh, setRefresh] = useState(0);

  const handleUrlCreated = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Link2 className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">Fast & Secure URL Shortener</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">URLGPT</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Transform long URLs into short, powerful links
            </p>
            <p className="text-sm text-muted-foreground/70">
              by Riste aka ExploitZ3r0
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl glow-sm">
            <UrlShortenerForm onUrlCreated={handleUrlCreated} />
            
            <div className="border-t border-border/50 mt-8 pt-8">
              <h2 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Your Shortened URLs
              </h2>
              <UrlList refresh={refresh} />
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              Lightning Fast
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 text-primary" />
              Global CDN
            </div>
            <Link to="/widget" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/50 text-sm text-primary hover:bg-primary/30 transition-colors">
              <Code className="w-4 h-4" />
              API & Widget
            </Link>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <TrustedBy />

      {/* Footer */}
      <div className="text-center py-8 border-t border-border/30">
        <p className="text-xs text-muted-foreground/50">
          Powered by Lovable Cloud • Links expire after 30 days
        </p>
      </div>
    </div>
  );
};

export default Index;