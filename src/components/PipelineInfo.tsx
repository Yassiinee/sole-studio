import React from "react";
import { Sparkles } from "lucide-react";

const STEPS = [
  {
    n: "1",
    title: "Groq Vision",
    sub: "llama-4-scout-17b",
    desc: "Reads your shoe — identifies brand, colorway, materials, sole design.",
  },
  {
    n: "2",
    title: "Prompt Builder",
    sub: "Automatic",
    desc: "Crafts a hyper-detailed studio photography prompt for your exact shoe.",
  },
  {
    n: "3",
    title: "FLUX.1-schnell",
    sub: "via HuggingFace",
    desc: "Generates 1024×1024 photorealistic studio shot in ~10 s.",
  },
];

export default function PipelineInfo() {
  return (
    <div className="bg-[#111] text-white rounded-3xl p-6">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Sparkles size={13} className="text-yellow-400" /> AI Pipeline
      </h3>
      <ol className="space-y-4 text-xs text-white/50">
        {STEPS.map(({ n, title, sub, desc }) => (
          <li key={n} className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-white/10 text-[9px] font-bold flex items-center justify-center shrink-0 text-white/70 mt-0.5">
              {n}
            </span>
            <div>
              <p className="text-white font-semibold">
                {title}{" "}
                <span className="text-white/30 font-normal">({sub})</span>
              </p>
              <p className="mt-0.5">{desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
