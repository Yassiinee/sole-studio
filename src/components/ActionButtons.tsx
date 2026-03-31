import React from "react";
import { Zap, ChevronRight, RefreshCw, Download, Sparkles } from "lucide-react";
import { Stage } from "../types";

interface ActionButtonsProps {
  stage: Stage;
  isProcessing: boolean;
  hasFile: boolean;
  onStep1: () => void;
  onStep2: () => void;
  onDownload: () => void;
}

export default function ActionButtons({
  stage,
  isProcessing,
  hasFile,
  onStep1,
  onStep2,
  onDownload,
}: ActionButtonsProps) {
  // ── Step 2 ready — prompt generated, awaiting user trigger ───────────────
  if (stage === "analyzed") {
    return (
      <div className="mt-5 space-y-3">
        <button
          onClick={onStep2}
          className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.015] active:scale-[0.985] transition-all"
        >
          <Zap size={16} className="text-yellow-400" />
          Generate 4K Studio Image
          <ChevronRight size={14} />
        </button>
        <button
          onClick={onStep1}
          className="w-full border border-black/10 rounded-2xl py-2.5 text-xs font-semibold text-black/35 hover:text-black hover:border-black/25 flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw size={12} /> Re-analyse Shoe
        </button>
      </div>
    );
  }

  // ── Done — show regenerate & download ────────────────────────────────────
  if (stage === "done") {
    return (
      <div className="flex gap-3 mt-5">
        <button
          onClick={onStep1}
          className="flex-1 border-2 border-black/10 rounded-2xl py-3.5 text-sm font-semibold text-black/45 hover:text-black hover:border-black/25 flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw size={13} /> Regenerate
        </button>
        <button
          onClick={onDownload}
          className="flex-1 bg-black text-white rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.015] transition-all"
        >
          <Download size={13} /> Download
        </button>
      </div>
    );
  }

  // ── Default — Step 1 trigger ─────────────────────────────────────────────
  return (
    <div className="mt-5">
      <button
        onClick={onStep1}
        disabled={isProcessing || !hasFile}
        className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.015] active:scale-[0.985] transition-all disabled:opacity-40 disabled:hover:scale-100"
      >
        {isProcessing && stage === "analyzing" ? (
          <>
            <Sparkles size={16} className="animate-pulse text-amber-400" />{" "}
            Analysing...
          </>
        ) : isProcessing && stage === "generating" ? (
          <>
            <Zap size={16} className="animate-pulse text-yellow-400" />{" "}
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} className="text-amber-400" /> Analyse Shoe{" "}
            <ChevronRight size={14} />
          </>
        )}
      </button>
    </div>
  );
}
