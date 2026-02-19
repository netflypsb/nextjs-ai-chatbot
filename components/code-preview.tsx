"use client";

import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type CodePreviewProps = {
  code: string;
  language?: string;
  className?: string;
};

function detectLanguage(code: string): string {
  if (code.includes("<!DOCTYPE html>") || code.includes("<html")) {
    return "html";
  }
  if (
    code.includes("import React") ||
    code.includes("from 'react'") ||
    code.includes('from "react"')
  ) {
    return "react";
  }
  if (
    code.includes("document.") ||
    code.includes("window.") ||
    code.includes("function ") ||
    code.includes("const ") ||
    code.includes("let ")
  ) {
    // Check if it has JSX-like syntax
    if (
      code.includes("=>") &&
      (code.includes("<div") || code.includes("<span") || code.includes("<p"))
    ) {
      return "react";
    }
    return "javascript";
  }
  if (code.includes("<svg") || code.includes("<SVG")) {
    return "svg";
  }
  return "unknown";
}

function wrapAsHtml(code: string, language: string): string {
  if (language === "html" || language === "svg") {
    return code;
  }

  if (language === "react") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://esm.sh/react@18.3.1"></script>
  <script src="https://esm.sh/react-dom@18.3.1"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    ${code}

    // Auto-render: find the default export or last component
    const components = {};
    try {
      // Try to render App if it exists
      if (typeof App !== 'undefined') {
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
      }
    } catch(e) {
      document.getElementById('root').innerHTML = '<pre style="color:red;padding:16px;">' + e.message + '</pre>';
    }
  </script>
</body>
</html>`;
  }

  if (language === "javascript") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; }
    #output { white-space: pre-wrap; font-family: monospace; }
  </style>
</head>
<body>
  <div id="output"></div>
  <script>
    const _origLog = console.log;
    const _output = [];
    console.log = (...args) => {
      _output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
      document.getElementById('output').textContent = _output.join('\\n');
      _origLog(...args);
    };
    try {
      ${code}
    } catch(e) {
      document.getElementById('output').innerHTML = '<span style="color:red;">' + e.message + '</span>';
    }
  </script>
</body>
</html>`;
  }

  return "";
}

export function CodePreview({ code, language, className }: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const detectedLang = useMemo(
    () => language || detectLanguage(code),
    [code, language]
  );

  const htmlContent = useMemo(
    () => wrapAsHtml(code, detectedLang),
    [code, detectedLang]
  );

  const isPreviewable = detectedLang !== "unknown" && detectedLang !== "python";

  if (!isPreviewable) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
        Preview not available for this language. Only HTML, JavaScript, React,
        and SVG can be previewed.
      </div>
    );
  }

  if (!htmlContent) {
    return null;
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <iframe
        className="h-full w-full border-0 bg-white"
        ref={iframeRef}
        sandbox="allow-scripts allow-modals allow-popups allow-same-origin"
        srcDoc={htmlContent}
        title="Code Preview"
      />
    </div>
  );
}
