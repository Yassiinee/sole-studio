import React from "react";

export default function AppFooter() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-black/5 flex items-center justify-between">
      <p className="text-xs text-black/25">© 2026 SoleStudio Pro</p>
      <p className="text-xs text-black/20">
        Groq llama-4-scout-17b · FLUX.1-schnell via HuggingFace · Proxied via
        Vite
      </p>
    </footer>
  );
}
