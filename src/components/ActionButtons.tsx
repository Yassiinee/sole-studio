import React from "react";
import { Zap, ChevronRight, RefreshCw, Download } from "lucide-react";
import { Stage } from "../types";

interface ActionButtonsProps {
  stage: Stage;
  isProcessing: boolean;
  hasFile: boolean;
  onRun: () => void;
  onDownload: () => void;
}

export default function ActionButtons({
  stage,
  isProcessing,
  hasFile,
  onRun,
  onDownload,
}: ActionButtonsProps) {
  if (stage === "done") {
    return (
      <div className="flex gap-3 mt-5">
        <button
          onClick={onRun}
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

  return (
    <div className="mt-5">
      <button
        onClick={onRun}
        disabled={isProcessing || !hasFile}
        className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.015] active:scale-[0.985] transition-all disabled:opacity-40 disabled:hover:scale-100"
      >
        {isProcessing ? (
          <>
            <Zap size={16} className="animate-pulse text-yellow-400" />{" "}
            Processing...
          </>
        ) : (
          <>
            <Zap size={16} className="text-yellow-400" /> Analyse & Generate{" "}
            <ChevronRight size={14} />
          </>
        )}
      </button>
    </div>
  );
}
