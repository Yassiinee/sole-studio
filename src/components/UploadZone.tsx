import React, { useRef } from "react";
import { Upload, CheckCircle2 } from "lucide-react";

interface UploadZoneProps {
  hasFile: boolean;
  onFile: (file: File) => void;
}

export default function UploadZone({ hasFile, onFile }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-7 cursor-pointer transition-all flex flex-col items-center text-center
        ${
          hasFile
            ? "border-emerald-400/40 bg-emerald-50/25"
            : "border-black/10 hover:border-black/25 hover:bg-black/[0.015]"
        }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {hasFile ? (
        <>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-sm font-semibold text-emerald-700">
            Shoe uploaded
          </span>
          <span className="text-xs text-black/30 mt-1 underline">Change</span>
        </>
      ) : (
        <>
          <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center mb-2">
            <Upload size={17} className="text-black/35" />
          </div>
          <p className="text-sm font-semibold">Click or drag & drop</p>
          <p className="text-xs text-black/35 mt-0.5">PNG · JPG · WEBP</p>
        </>
      )}
    </div>
  );
}
