import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Key, Code, Download, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Widget = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [processedHtml, setProcessedHtml] = useState<string | null>(null);
  const { toast } = useToast();

  const generateApiKey = async () => {
    setLoading(true);
    try {
      const key = `urlgpt_${crypto.randomUUID().replace(/-/g, "")}`;
      
      const { error } = await supabase.from("api_keys").insert({ api_key: key });
      
      if (error) throw error;
      
      setApiKey(key);
      toast({
        title: "API Key Generated!",
        description: "Save this key securely. You won't see it again.",
      });
    } catch (error) {
      console.error("Error generating API key:", error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Copied to clipboard" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".html")) {
      setHtmlFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an HTML file",
        variant: "destructive",
      });
    }
  };

  const processHtmlFile = async () => {
    if (!htmlFile || !apiKey) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      const widgetScript = `
<!-- URLGPT Widget -->
<script>
(function() {
  var URLGPT_API_KEY = '${apiKey}';
  var URLGPT_API_URL = '${window.location.origin}/functions/v1/shorten';
  
  window.URLGPT = {
    shorten: function(url, customCode) {
      return fetch(URLGPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': URLGPT_API_KEY
        },
        body: JSON.stringify({ url: url, customCode: customCode })
      }).then(function(r) { return r.json(); });
    }
  };
  
  // Auto-initialize forms with data-urlgpt attribute
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-urlgpt]').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var input = form.querySelector('input[type="url"], input[name="url"]');
        var customInput = form.querySelector('input[name="customCode"]');
        if (input) {
          URLGPT.shorten(input.value, customInput?.value).then(function(result) {
            if (result.shortUrl) {
              var output = form.querySelector('[data-urlgpt-output]');
              if (output) output.textContent = result.shortUrl;
              var event = new CustomEvent('urlgpt:shortened', { detail: result });
              form.dispatchEvent(event);
            }
          });
        }
      });
    });
  });
})();
</script>
<!-- End URLGPT Widget -->
`;
      
      // Insert widget - handle case-insensitive tags and various HTML formats
      let newContent;
      const headMatch = content.match(/<\/head\s*>/i);
      const bodyMatch = content.match(/<\/body\s*>/i);
      const htmlMatch = content.match(/<\/html\s*>/i);
      
      if (headMatch) {
        newContent = content.replace(headMatch[0], widgetScript + "\n" + headMatch[0]);
      } else if (bodyMatch) {
        newContent = content.replace(bodyMatch[0], widgetScript + "\n" + bodyMatch[0]);
      } else if (htmlMatch) {
        newContent = content.replace(htmlMatch[0], widgetScript + "\n" + htmlMatch[0]);
      } else {
        // For HTML fragments or files without standard structure, append at the end
        newContent = content + "\n" + widgetScript;
      }
      
      setProcessedHtml(newContent);
      toast({
        title: "Widget Added!",
        description: "Click download to get your updated HTML file",
      });
    };
    reader.readAsText(htmlFile);
  };

  const downloadProcessedHtml = () => {
    if (!processedHtml || !htmlFile) return;
    
    const blob = new Blob([processedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urlgpt_${htmlFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const widgetCode = `<!-- URLGPT Widget -->
<script>
(function() {
  var URLGPT_API_KEY = 'YOUR_API_KEY';
  var URLGPT_API_URL = '${window.location.origin}/functions/v1/shorten';
  
  window.URLGPT = {
    shorten: function(url, customCode) {
      return fetch(URLGPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': URLGPT_API_KEY
        },
        body: JSON.stringify({ url: url, customCode: customCode })
      }).then(function(r) { return r.json(); });
    }
  };
})();
</script>`;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        
        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">API & Widget</span>
          </h1>
          <p className="text-muted-foreground mb-8">Integrate URLGPT into any website</p>

          {/* API Key Section */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6 glow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">API Key</h2>
            </div>
            
            {apiKey ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input value={apiKey} readOnly className="font-mono text-sm" />
                  <Button onClick={() => copyToClipboard(apiKey)} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-destructive">⚠️ Save this key now. You won't see it again!</p>
              </div>
            ) : (
              <Button onClick={generateApiKey} disabled={loading} className="w-full">
                {loading ? "Generating..." : "Generate API Key"}
              </Button>
            )}
          </div>

          {/* Widget Code Section */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6 glow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Widget Code</h2>
            </div>
            
            <div className="relative">
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs text-muted-foreground">
                <code>{widgetCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(widgetCode)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Usage:</p>
              <pre className="bg-secondary p-3 rounded text-xs overflow-x-auto">
{`// Shorten a URL
URLGPT.shorten('https://example.com/long-url')
  .then(result => console.log(result.shortUrl));

// With custom code
URLGPT.shorten('https://example.com', 'mylink')
  .then(result => console.log(result.shortUrl));`}
              </pre>
            </div>
          </div>

          {/* Automatic Widget Adder */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 glow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Automatic Widget Adder</h2>
            </div>
            
            {!apiKey ? (
              <p className="text-muted-foreground text-sm">Generate an API key first to use this feature.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Upload your HTML file
                  </label>
                  <Input
                    type="file"
                    accept=".html"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>
                
                {htmlFile && (
                  <div className="flex gap-2">
                    <Button onClick={processHtmlFile} className="flex-1">
                      Add Widget to File
                    </Button>
                  </div>
                )}
                
                {processedHtml && (
                  <Button onClick={downloadProcessedHtml} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Updated HTML
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;
