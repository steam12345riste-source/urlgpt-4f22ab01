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
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

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
<!-- URLGPT Draggable Widget -->
<script>
(function() {
  'use strict';

  var URLGPT_API = '${apiUrl}';
  var URLGPT_APP = '${appUrl}';

  function injectStyles() {
    if (document.getElementById('urlgpt-widget-styles')) return;
    var st = document.createElement('style');
    st.id = 'urlgpt-widget-styles';
    st.textContent = \`
      .urlgpt-glass { background: rgba(10,10,10,.95); backdrop-filter: blur(12px); border: 1px solid rgba(34,197,94,.2); }
      .urlgpt-btn-gradient { background: linear-gradient(135deg, #22c55e, #16a34a); }
      .urlgpt-glow { box-shadow: 0 0 30px rgba(34,197,94,.3); }
      @keyframes urlgptSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .urlgpt-slide { animation: urlgptSlideUp .25s ease-out; }
      .urlgpt-drag { cursor: grab; user-select: none; }
      .urlgpt-drag:active { cursor: grabbing; }
      #urlgptWidget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    \`;
    document.head.appendChild(st);
  }

  function createWidget() {
    document.body.insertAdjacentHTML('beforeend', \`
      <div id="urlgptWidget" style="position:fixed; z-index:999999; left:20px; bottom:20px; touch-action:none;">
        
        <div id="urlgptPanel" style="display:none; margin-bottom:16px; width:360px; border-radius:16px; padding:24px;" class="urlgpt-glass urlgpt-glow urlgpt-slide">
          
          <div class="urlgpt-drag" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🔗</span>
              <span style="color:#22c55e; font-weight:700; font-size:16px;">URLGPT</span>
            </div>
            <button id="urlgptClose" style="background:none; border:none; color:#666; cursor:pointer; font-size:20px; line-height:1;">×</button>
          </div>

          <form id="urlgptForm" style="display:flex; flex-direction:column; gap:12px;">
            <input id="urlgptInput" type="url" placeholder="Paste your long URL here..." required 
              style="width:100%; padding:12px 16px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;">
            <input id="urlgptCustom" type="text" placeholder="Custom code (optional)" 
              style="width:100%; padding:12px 16px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#fff; font-size:14px; outline:none;">
            <button id="urlgptSubmit" type="submit" class="urlgpt-btn-gradient" 
              style="width:100%; padding:12px; border:none; border-radius:10px; color:#000; font-weight:600; font-size:14px; cursor:pointer; transition:transform .2s;">
              Shorten URL
            </button>
          </form>

          <div id="urlgptResult" style="display:none; margin-top:16px; padding:16px; background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2); border-radius:10px;">
            <p style="color:#888; font-size:11px; margin-bottom:8px;">Shortened URL:</p>
            <div style="display:flex; gap:8px; align-items:center;">
              <a id="urlgptLink" href="#" target="_blank" style="flex:1; color:#22c55e; font-size:13px; word-break:break-all; text-decoration:none;"></a>
              <button id="urlgptCopy" style="padding:8px 16px; background:#22c55e; color:#000; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">Copy</button>
            </div>
          </div>

          <div id="urlgptError" style="display:none; margin-top:12px; padding:12px; background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.2); border-radius:10px;">
            <p id="urlgptErrorMsg" style="color:#ef4444; font-size:12px;"></p>
          </div>

          <p style="color:#555; font-size:10px; text-align:center; margin-top:16px;">Links expire after 30 days</p>
        </div>

        <button id="urlgptFloat" style="width:60px; height:60px; border-radius:50%; border:2px solid #22c55e; background:#0a0a0a; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:24px; transition:transform .2s, box-shadow .2s;" class="urlgpt-glow">
          🔗
        </button>

      </div>
    \`);
  }

  function makeDraggable() {
    var widget = document.getElementById('urlgptWidget');
    var posX = 0, posY = 0, mouseX = 0, mouseY = 0, dragging = false;

    function start(e) {
      dragging = true;
      mouseX = e.touches ? e.touches[0].clientX : e.clientX;
      mouseY = e.touches ? e.touches[0].clientY : e.clientY;
    }

    function move(e) {
      if (!dragging) return;
      var x = e.touches ? e.touches[0].clientX : e.clientX;
      var y = e.touches ? e.touches[0].clientY : e.clientY;
      posX += x - mouseX;
      posY += y - mouseY;
      mouseX = x;
      mouseY = y;
      widget.style.transform = 'translate(' + posX + 'px, ' + posY + 'px)';
    }

    function stop() { dragging = false; }

    widget.addEventListener('mousedown', start);
    widget.addEventListener('touchstart', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
  }

  function initWidget() {
    var panel = document.getElementById('urlgptPanel');
    var floatBtn = document.getElementById('urlgptFloat');
    var closeBtn = document.getElementById('urlgptClose');
    var form = document.getElementById('urlgptForm');
    var input = document.getElementById('urlgptInput');
    var customInput = document.getElementById('urlgptCustom');
    var submitBtn = document.getElementById('urlgptSubmit');
    var result = document.getElementById('urlgptResult');
    var link = document.getElementById('urlgptLink');
    var copyBtn = document.getElementById('urlgptCopy');
    var errorBox = document.getElementById('urlgptError');
    var errorMsg = document.getElementById('urlgptErrorMsg');

    function togglePanel() {
      var isHidden = panel.style.display === 'none';
      panel.style.display = isHidden ? 'block' : 'none';
      if (isHidden) input.focus();
    }

    floatBtn.onclick = togglePanel;
    closeBtn.onclick = togglePanel;

    form.onsubmit = function(e) {
      e.preventDefault();
      var url = input.value.trim();
      var custom = customInput.value.trim();
      if (!url) return;

      submitBtn.textContent = 'Shortening...';
      submitBtn.disabled = true;
      result.style.display = 'none';
      errorBox.style.display = 'none';

      fetch(URLGPT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, customCode: custom || undefined })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.shortUrl) {
          link.textContent = data.shortUrl;
          link.href = data.shortUrl;
          result.style.display = 'block';
          input.value = '';
          customInput.value = '';
        } else {
          errorMsg.textContent = data.error || 'Failed to shorten URL';
          errorBox.style.display = 'block';
        }
      })
      .catch(function() {
        errorMsg.textContent = 'Network error. Please try again.';
        errorBox.style.display = 'block';
      })
      .finally(function() {
        submitBtn.textContent = 'Shorten URL';
        submitBtn.disabled = false;
      });
    };

    copyBtn.onclick = function() {
      navigator.clipboard.writeText(link.textContent).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
      });
    };

    // Hover effects
    floatBtn.onmouseenter = function() { floatBtn.style.transform = 'scale(1.1)'; };
    floatBtn.onmouseleave = function() { floatBtn.style.transform = 'scale(1)'; };
    submitBtn.onmouseenter = function() { if (!submitBtn.disabled) submitBtn.style.transform = 'scale(1.02)'; };
    submitBtn.onmouseleave = function() { submitBtn.style.transform = 'scale(1)'; };
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectStyles();
      createWidget();
      initWidget();
      makeDraggable();
    });
  } else {
    injectStyles();
    createWidget();
    initWidget();
    makeDraggable();
  }
})();
</script>
<!-- End URLGPT Widget -->`;

  const processHtmlFile = async () => {
    if (!htmlFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const widgetScript = getWidgetScript();
      
      let newContent;
      const headMatch = content.match(/<\/head\s*>/i);
      const bodyMatch = content.match(/<\/body\s*>/i);
      const htmlMatch = content.match(/<\/html\s*>/i);
      
      if (bodyMatch) {
        newContent = content.replace(bodyMatch[0], widgetScript + "\n" + bodyMatch[0]);
      } else if (headMatch) {
        newContent = content.replace(headMatch[0], widgetScript + "\n" + headMatch[0]);
      } else if (htmlMatch) {
        newContent = content.replace(htmlMatch[0], widgetScript + "\n" + htmlMatch[0]);
      } else {
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
  <title>URLGPT Widget Demo</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      min-height: 100vh;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .demo-content {
      text-align: center;
      padding: 40px;
    }
    h1 { font-size: 48px; margin-bottom: 16px; }
    h1 span { color: #22c55e; }
    p { color: #888; font-size: 18px; margin-bottom: 32px; }
    .arrow { 
      position: fixed; 
      bottom: 100px; 
      left: 100px; 
      color: #22c55e; 
      font-size: 24px;
      animation: bounce 1s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  </style>
</head>
<body>
  <div class="demo-content">
    <h1>Welcome to <span>URLGPT</span></h1>
    <p>Click the floating button in the corner to shorten any URL!</p>
    <p>You can drag the widget anywhere on the page.</p>
  </div>
  <div class="arrow">↙ Click here!</div>
${getWidgetScript()}
</body>
</html>`;

    const blob = new Blob([exampleHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "urlgpt-widget-demo.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Open the file in your browser to see the draggable widget",
    });
  };

  const widgetCode = getWidgetScript();

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
            <span className="text-gradient">Draggable Widget</span>
          </h1>
          <p className="text-muted-foreground mb-8">Add a floating URL shortener to any website - No API key needed!</p>

          {/* Example Download */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6 glow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Quick Start - Download Demo</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Download a demo page with the draggable widget. Open it in your browser to test the floating shortener!
            </p>
            <Button onClick={downloadExampleHtml} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Demo HTML
            </Button>
          </div>

          {/* Widget Code Section */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6 glow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Widget Code</h2>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4">
              Copy this script and paste it before the closing <code className="bg-secondary px-1 rounded">&lt;/body&gt;</code> tag of any HTML file.
            </p>
            
            <div className="relative">
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs text-muted-foreground max-h-64">
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
            
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary mb-2">Features:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Draggable floating button</li>
                <li>• Slide-up panel with glass effect</li>
                <li>• Custom short code support</li>
                <li>• Copy to clipboard</li>
                <li>• Works on any website</li>
                <li>• No API key required</li>
              </ul>
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
