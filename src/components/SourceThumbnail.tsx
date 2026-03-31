import React from "react";
import { motion } from "motion/react";

interface SourceThumbnailProps {
  src: string;
}

export default function SourceThumbnail({ src }: SourceThumbnailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-4 border border-black/5 shadow-sm"
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/28 mb-3 px-1">
        Source Photo
      </p>
      <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F5F5]">
        <img
          src={src}
          alt="Source shoe"
          className="w-full h-full object-contain"
        />
      </div>
    </motion.div>
  );
}
