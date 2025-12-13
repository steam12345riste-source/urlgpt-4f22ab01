import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Code, Download, Upload, ArrowLeft, FileCode } from "lucide-react";
import { Link } from "react-router-dom";

const Widget = () => {
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [processedHtml, setProcessedHtml] = useState<string | null>(null);
  const { toast } = useToast();

  const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "twguhrekvglsqqyqqqkw";
  const apiUrl = `https://${supabaseProjectId}.supabase.co/functions/v1/shorten`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Copied to clipboard" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith(".html") || file.name.endsWith(".htm"))) {
      setHtmlFile(file);
      setProcessedHtml(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an HTML file",
        variant: "destructive",
      });
    }
  };

  const getWidgetScript = () => `
<!-- URLGPT Widget -->
<script>
(function() {
  var URLGPT_API_URL = '${apiUrl}';
  
  window.URLGPT = {
    shorten: function(url, customCode) {
      return fetch(URLGPT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        
        if (input && input.value) {
          URLGPT.shorten(input.value, customInput ? customInput.value : null).then(function(result) {
            if (submitBtn) submitBtn.disabled = false;
            if (result.shortUrl) {
              var output = form.querySelector('[data-urlgpt-output]');
              if (output) {
                output.textContent = result.shortUrl;
                output.href = result.shortUrl;
              }
              var event = new CustomEvent('urlgpt:shortened', { detail: result });
              form.dispatchEvent(event);
            } else if (result.error) {
              alert('Error: ' + result.error);
            }
          }).catch(function(err) {
            if (submitBtn) submitBtn.disabled = false;
            alert('Error shortening URL');
          });
        }
      });
    });
  });
})();
</script>
<!-- End URLGPT Widget -->`;

  const processHtmlFile = async () => {
    if (!htmlFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const widgetScript = getWidgetScript();
      
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

  const downloadExampleHtml = () => {
    const exampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>URLGPT Widget Example</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a; 
      color: #fff; 
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: #111;
      border: 1px solid #222;
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 100%;
    }
    h1 { 
      font-size: 24px; 
      margin-bottom: 8px;
      color: #22c55e;
    }
    p { color: #888; margin-bottom: 24px; }
    form { display: flex; flex-direction: column; gap: 12px; }
    input {
      background: #0a0a0a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 12px 16px;
      color: #fff;
      font-size: 14px;
    }
    input:focus { outline: none; border-color: #22c55e; }
    button {
      background: #22c55e;
      color: #000;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .result {
      margin-top: 16px;
      padding: 16px;
      background: #0a0a0a;
      border-radius: 8px;
      border: 1px solid #333;
    }
    .result a {
      color: #22c55e;
      text-decoration: none;
      word-break: break-all;
    }
    .result a:hover { text-decoration: underline; }
    .hidden { display: none; }
  </style>
${getWidgetScript()}
</head>
<body>
  <div class="container">
    <h1>🔗 URL Shortener</h1>
    <p>Shorten any URL instantly</p>
    
    <form data-urlgpt>
      <input type="url" name="url" placeholder="Enter your long URL..." required>
      <input type="text" name="customCode" placeholder="Custom code (optional)">
      <button type="submit">Shorten URL</button>
      
      <div class="result hidden">
        <a href="#" data-urlgpt-output target="_blank"></a>
      </div>
    </form>
  </div>

  <script>
    // Show result when URL is shortened
    document.querySelector('[data-urlgpt]').addEventListener('urlgpt:shortened', function(e) {
      var resultDiv = this.querySelector('.result');
      resultDiv.classList.remove('hidden');
    });
  </script>
</body>
</html>`;

    const blob = new Blob([exampleHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "urlgpt-example.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Open urlgpt-example.html in your browser to test",
    });
  };

  const widgetCode = `<!-- URLGPT Widget - No API Key Required! -->
<script>
(function() {
  var URLGPT_API_URL = '${apiUrl}';
  
  window.URLGPT = {
    shorten: function(url, customCode) {
      return fetch(URLGPT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            <span className="text-gradient">Widget Integration</span>
          </h1>
          <p className="text-muted-foreground mb-8">Add URL shortening to any website - No API key needed!</p>

          {/* Example Download */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6 glow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Quick Start - Download Example</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Download a ready-to-use HTML file with the widget already integrated. Open it in your browser to test!
            </p>
            <Button onClick={downloadExampleHtml} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Example HTML
            </Button>
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

            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Or use with HTML form:</p>
              <pre className="bg-secondary p-3 rounded text-xs overflow-x-auto">
{`<form data-urlgpt>
  <input type="url" name="url" placeholder="Enter URL" required>
  <input type="text" name="customCode" placeholder="Custom code (optional)">
  <button type="submit">Shorten</button>
  <a href="#" data-urlgpt-output></a>
</form>`}
              </pre>
            </div>
          </div>

          {/* Automatic Widget Adder */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 glow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Add Widget to Your HTML</h2>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4">
              Upload your HTML file and we'll automatically inject the widget code.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Upload your HTML file
                </label>
                <Input
                  type="file"
                  accept=".html,.htm"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;
