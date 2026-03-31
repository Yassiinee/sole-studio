import React, { useState } from "react";
import { Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PromptViewerProps {
  prompt: string | null;
}

export default function PromptViewer({ prompt }: PromptViewerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AnimatePresence>
      {prompt && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden mt-4"
        >
          <button
            onClick={() => setVisible((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-black/8 hover:border-black/20 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm text-black/60 font-semibold">
              <Edit3 size={14} /> Generated FLUX Prompt
            </span>
            <span className="text-[10px] text-black/30 font-bold uppercase tracking-widest">
              {visible ? "Hide" : "View"}
            </span>
          </button>

          {visible && (
            <div className="mt-2 p-3 bg-black/3 rounded-xl">
              <p className="text-xs font-mono leading-relaxed text-black/55">
                {prompt}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
