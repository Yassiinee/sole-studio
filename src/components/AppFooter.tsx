import React from "react";

export default function AppFooter() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex flex-col items-center sm:items-start gap-1">
        <p className="text-xs text-black/25">© 2026 SoleStudio Pro</p>
        <p className="text-[10px] text-black/30">
          Crafted by{" "}
          <a
            href="https://github.com/Yassiinee"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:text-black transition-colors"
          >
            Yassine Zakhama
          </a>
        </p>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-black/20 text-center sm:text-right max-w-md">
        @imgly/background-removal (WASM) · HTML5 Canvas Studio · GSAP · Supabase
        · React 19
      </p>
    </footer>
  );
}
