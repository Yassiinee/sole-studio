import React from "react";
import {
  Download,
  AlertCircle,
  Sparkles,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Stage } from "../types";

interface StudioCanvasProps {
  stage: Stage;
  isProcessing: boolean;
  statusMsg: string;
  original: string | null;
  generated: string | null;
  onDownload: () => void;
}

function StageBadge({ stage }: { stage: Stage }) {
  if (stage === "done")
    return (
      <span className="ml-2 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
        ✓ 4K Ready
      </span>
    );
  if (stage === "analyzing")
    return (
      <span className="ml-2 text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
        Step 1 · Groq Vision
      </span>
    );
  if (stage === "generating")
    return (
      <span className="ml-2 text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
        Step 2 · FLUX
      </span>
    );
  return null;
}

export default function StudioCanvas({
  stage,
  isProcessing,
  statusMsg,
  original,
  generated,
  onDownload,
}: StudioCanvasProps) {
  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-black/5 min-h-[620px] flex flex-col">
      {/* Canvas header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-black/15" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/30">
            Studio Canvas
          </span>
          <StageBadge stage={stage} />
        </div>
        {generated && (
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-black/35 hover:text-black transition-colors"
          >
            <Download size={11} /> Download PNG
          </button>
        )}
      </div>

      {/* Canvas body */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Idle / Ready placeholder */}
          {(stage === "idle" || stage === "ready") && !generated && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-black/4 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon size={28} className="text-black/15" />
              </div>
              <p className="font-semibold text-black/20">
                Your 4K studio shot appears here
              </p>
              <p className="text-xs text-black/13 mt-1">
                {stage === "ready"
                  ? "Upload done — hit Analyse & Generate"
                  : "Upload a shoe photo to get started"}
              </p>
            </motion.div>
          )}

          {/* Processing spinner */}
          {isProcessing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className="relative w-24 h-24 mb-7">
                <div className="absolute inset-0 rounded-full border-4 border-black/5" />
                <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin" />
                {stage === "analyzing" ? (
                  <Sparkles
                    size={22}
                    className="absolute inset-0 m-auto text-amber-500 animate-pulse"
                  />
                ) : (
                  <Zap
                    size={22}
                    className="absolute inset-0 m-auto text-yellow-500 animate-pulse"
                  />
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/30 mb-1">
                {stage === "analyzing"
                  ? "Step 1 of 2 — Groq Vision"
                  : "Step 2 of 2 — FLUX.1-schnell"}
              </span>
              <h3 className="text-base font-bold mb-2">
                {stage === "analyzing"
                  ? "Analysing your shoe..."
                  : "Generating studio image..."}
              </h3>
              <p className="text-sm text-black/35 italic h-10 leading-relaxed">
                {statusMsg}
              </p>
              <div className="mt-6 w-64 h-1.5 bg-black/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-black rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: stage === "analyzing" ? "42%" : "92%" }}
                  transition={{
                    duration: stage === "analyzing" ? 5 : 14,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Done — side-by-side comparison */}
          {stage === "done" && generated && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full flex flex-col gap-5"
            >
              <div className="grid md:grid-cols-2 gap-5 flex-1">
                {/* Original */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/28 px-1">
                    Original
                  </span>
                  <div className="flex-1 aspect-square rounded-2xl overflow-hidden border border-black/5 bg-[#F5F5F5]">
                    <img
                      src={original!}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                {/* Studio result */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 px-1">
                    4K Studio Result
                  </span>
                  <div className="flex-1 aspect-square rounded-2xl overflow-hidden border border-black/5 bg-[#E8E8E8] relative group shadow-xl">
                    <img
                      src={generated}
                      alt="Studio shot"
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={onDownload}
                        className="bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 translate-y-3 group-hover:translate-y-0 transition-transform"
                      >
                        <Download size={14} /> Download 4K
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {stage === "error" && !isProcessing && (
            <motion.div
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <AlertCircle size={40} className="text-red-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-black/35">
                Pipeline failed
              </p>
              <p className="text-xs text-black/22 mt-1">
                See details on the left
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Canvas footer metadata */}
      <div className="px-6 py-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-black/22">
        <span>Groq llama-4-scout · FLUX.1-schnell · 1024×1024</span>
        <div className="flex items-center gap-3">
          <span>Grey #E8E8E8</span>
          <div className="w-1 h-1 rounded-full bg-black/15" />
          <span>Studio Lighting</span>
          <div className="w-1 h-1 rounded-full bg-black/15" />
          <span>Soft Shadow</span>
        </div>
      </div>
    </div>
  );
}
