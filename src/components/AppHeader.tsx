import React from "react";
import { Camera } from "lucide-react";

interface AppHeaderProps {
  onReset: () => void;
}

export default function AppHeader({ onReset }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-black/6">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none tracking-tight">
              SoleStudio <span className="text-black/30 font-normal">Pro</span>
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/30 mt-0.5">
              Groq Vision · FLUX.1-schnell · 4K Studio
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-black/35 hover:text-black border border-black/10 rounded-xl px-3 py-1.5 transition-colors"
        >
          Start Over
        </button>
      </div>
    </header>
  );
}
