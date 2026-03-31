/**
 * SoleStudio Pro
 * Step 1: Groq llama-4-scout-17b-16e (vision) → reads shoe → writes FLUX prompt
 * Step 2: HuggingFace router → fal-ai FLUX.1-schnell → 1024×1024 studio photo
 *
 * CORS fix: both APIs are proxied through Vite dev server (see vite.config.ts)
 *   /api/groq  → https://api.groq.com
 *   /api/hf    → https://router.huggingface.co
 *
 * .env:
 *   GROQ_API_KEY=gsk_...   (console.groq.com — free)
 *   HF_TOKEN=hf_...        (huggingface.co/settings/tokens — free, Read)
 */

import React, { useState, useRef } from "react";
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Zap,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Proxied endpoints (no CORS) ─────────────────────────────────────────────
const GROQ_URL = "/api/groq/openai/v1/chat/completions";
const HF_URL = "/api/hf/fal-ai/flux/schnell";

// ─── Step 1: Groq vision → FLUX prompt ───────────────────────────────────────
async function buildFluxPrompt(
  dataUrl: string,
  groqKey: string,
): Promise<string> {
  const mimeType = dataUrl.split(";")[0].split(":")[1];
  const base64 = dataUrl.split(",")[1];

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            {
              type: "text",
              text: `You are a professional product photographer and AI prompt engineer.
Carefully study the shoe in this image and write ONE detailed text-to-image prompt that will produce a stunning commercial product photo of this exact shoe.

The prompt MUST include:
- Precise shoe description: brand if visible, model style, exact colorway, materials, sole design, any logo or branding details
- "placed on a smooth seamless light grey (#E8E8E8) studio paper sweep backdrop"
- "soft diffused professional studio lighting from both sides with gentle front fill"
- "razor-sharp focus on every stitch, texture and material detail"
- "soft natural ground shadow directly beneath the shoe"
- "commercial ecommerce product photography, 4K, hyperrealistic, photographic"
- Shoe shown at 3/4 angle from the front-left, slightly elevated

Return ONLY the prompt text — no preamble, no quotes, no explanation.`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq error ${res.status}`);
  }

  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text)
    throw new Error("Groq returned an empty prompt — please try again.");
  return text;
}

// ─── Step 2: fal-ai FLUX.1-schnell via HF router → image ─────────────────────
async function generateImage(prompt: string, hfToken: string): Promise<string> {
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: "square_hd",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: false,
    }),
  });

  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.json();
      msg = j?.detail || j?.error || JSON.stringify(j);
    } catch {
      msg = await res.text().catch(() => "");
    }
    if (res.status === 401)
      throw new Error(
        "Invalid HF_TOKEN — check huggingface.co/settings/tokens",
      );
    if (res.status === 402)
      throw new Error(
        "HuggingFace: pre-paid credits required for fal-ai provider. See note below.",
      );
    if (res.status === 503)
      throw new Error("Model warming up — wait 30 s and try again.");
    throw new Error(`HuggingFace ${res.status}: ${String(msg).slice(0, 200)}`);
  }

  const data = await res.json();
  const imgUrl = data?.images?.[0]?.url;
  if (imgUrl) return imgUrl;
  const b64 = data?.images?.[0]?.b64_json;
  if (b64) return `data:image/png;base64,${b64}`;
  throw new Error(`Unexpected response: ${JSON.stringify(data).slice(0, 200)}`);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = "idle" | "ready" | "analyzing" | "generating" | "done" | "error";

interface AppState {
  original: string | null;
  generated: string | null;
  fluxPrompt: string | null;
  stage: Stage;
  statusMsg: string;
  error: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState<AppState>({
    original: null,
    generated: null,
    fluxPrompt: null,
    stage: "idle",
    statusMsg: "",
    error: null,
  });
  const [showPrompt, setShowPrompt] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTicker = (msgs: string[]) => {
    let i = 0;
    setState((p) => ({ ...p, statusMsg: msgs[0] }));
    tickerRef.current = setInterval(() => {
      i = (i + 1) % msgs.length;
      setState((p) => ({ ...p, statusMsg: msgs[i] }));
    }, 2200);
  };
  const stopTicker = () => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setState((p) => ({
        ...p,
        error: "Please upload a valid image file.",
        stage: "error",
      }));
      return;
    }
    const r = new FileReader();
    r.onload = (e) =>
      setState((p) => ({
        ...p,
        original: e.target?.result as string,
        generated: null,
        fluxPrompt: null,
        stage: "ready",
        error: null,
      }));
    r.readAsDataURL(file);
  };

  const run = async () => {
    const groqKey = (process.env as any).GROQ_API_KEY;
    const hfToken = (process.env as any).HF_TOKEN;

    if (!groqKey) {
      setState((p) => ({
        ...p,
        stage: "error",
        error: "GROQ_API_KEY missing from .env",
      }));
      return;
    }
    if (!hfToken) {
      setState((p) => ({
        ...p,
        stage: "error",
        error: "HF_TOKEN missing from .env",
      }));
      return;
    }
    if (!state.original) {
      setState((p) => ({
        ...p,
        stage: "error",
        error: "Please upload a shoe photo first.",
      }));
      return;
    }

    // ── Step 1: Groq vision ──────────────────────────────────────────────────
    setState((p) => ({
      ...p,
      stage: "analyzing",
      error: null,
      generated: null,
      fluxPrompt: null,
    }));
    startTicker([
      "Sending shoe to Groq Vision...",
      "Identifying brand, colorway & materials...",
      "Engineering the perfect FLUX prompt...",
      "Adding studio lighting descriptors...",
    ]);

    let prompt: string;
    try {
      prompt = await buildFluxPrompt(state.original, groqKey);
    } catch (err: any) {
      stopTicker();
      setState((p) => ({
        ...p,
        stage: "error",
        error: `Step 1 (Groq): ${err.message}`,
      }));
      return;
    }
    stopTicker();

    // ── Step 2: FLUX generation ──────────────────────────────────────────────
    setState((p) => ({ ...p, stage: "generating", fluxPrompt: prompt }));
    startTicker([
      "Sending to FLUX.1-schnell...",
      "Diffusing light grey studio backdrop...",
      "Rendering shoe geometry & textures...",
      "Painting soft ground shadow...",
      "Applying studio lighting pass...",
      "Finalising 4K commercial shot...",
    ]);

    let imageUrl: string;
    try {
      imageUrl = await generateImage(prompt, hfToken);
    } catch (err: any) {
      stopTicker();
      setState((p) => ({
        ...p,
        stage: "error",
        error: `Step 2 (FLUX): ${err.message}`,
      }));
      return;
    }

    stopTicker();
    setState((p) => ({
      ...p,
      stage: "done",
      generated: imageUrl,
      statusMsg: "",
    }));
  };

  const download = async () => {
    const { generated } = state;
    if (!generated) return;
    try {
      if (generated.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = generated;
        a.download = "solestudio-4k.png";
        a.click();
      } else {
        const res = await fetch(generated);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "solestudio-4k.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      window.open(generated, "_blank");
    }
  };

  const reset = () => {
    stopTicker();
    setState({
      original: null,
      generated: null,
      fluxPrompt: null,
      stage: "idle",
      statusMsg: "",
      error: null,
    });
  };

  const { original, generated, fluxPrompt, stage, statusMsg, error } = state;
  const isProcessing = stage === "analyzing" || stage === "generating";

  return (
    <div className="min-h-screen bg-[#EDEDEB] text-[#111] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-black/6">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-none tracking-tight">
                SoleStudio{" "}
                <span className="text-black/30 font-normal">Pro</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/30 mt-0.5">
                Groq Vision · FLUX.1-schnell · 4K Studio
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="text-xs font-semibold text-black/35 hover:text-black border border-black/10 rounded-xl px-3 py-1.5 transition-colors"
          >
            Start Over
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left panel */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold mb-1">Upload Shoe Photo</h2>
              <p className="text-black/40 text-sm mb-5">
                Groq Vision reads your shoe and writes a tailored FLUX prompt
                automatically.
              </p>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) processFile(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-7 cursor-pointer transition-all flex flex-col items-center text-center
                  ${original ? "border-emerald-400/40 bg-emerald-50/25" : "border-black/10 hover:border-black/25 hover:bg-black/[0.015]"}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processFile(f);
                  }}
                />
                {original ? (
                  <>
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">
                      Shoe uploaded
                    </span>
                    <span className="text-xs text-black/30 mt-1 underline">
                      Change
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center mb-2">
                      <Upload size={17} className="text-black/35" />
                    </div>
                    <p className="text-sm font-semibold">
                      Click or drag & drop
                    </p>
                    <p className="text-xs text-black/35 mt-0.5">
                      PNG · JPG · WEBP
                    </p>
                  </>
                )}
              </div>

              {/* FLUX prompt display after analysis */}
              <AnimatePresence>
                {fluxPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <button
                      onClick={() => setShowPrompt((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-black/8 hover:border-black/20 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm text-black/60 font-semibold">
                        <Edit3 size={14} /> Generated FLUX Prompt
                      </span>
                      <span className="text-[10px] text-black/30 font-bold uppercase tracking-widest">
                        {showPrompt ? "Hide" : "View"}
                      </span>
                    </button>
                    {showPrompt && (
                      <div className="mt-2 p-3 bg-black/3 rounded-xl">
                        <p className="text-xs font-mono leading-relaxed text-black/55">
                          {fluxPrompt}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <div className="mt-5">
                {stage === "done" ? (
                  <div className="flex gap-3">
                    <button
                      onClick={run}
                      className="flex-1 border-2 border-black/10 rounded-2xl py-3.5 text-sm font-semibold text-black/45 hover:text-black hover:border-black/25 flex items-center justify-center gap-2 transition-all"
                    >
                      <RefreshCw size={13} /> Regenerate
                    </button>
                    <button
                      onClick={download}
                      className="flex-1 bg-black text-white rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.015] transition-all"
                    >
                      <Download size={13} /> Download
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={run}
                    disabled={isProcessing || !original}
                    className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.015] active:scale-[0.985] transition-all disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <Zap
                          size={16}
                          className="animate-pulse text-yellow-400"
                        />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="text-yellow-400" /> Analyse &
                        Generate <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-2.5 text-red-600">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold mb-1">Error</p>
                    <p className="text-xs leading-relaxed break-words">
                      {error}
                    </p>
                    <button
                      onClick={run}
                      className="mt-2 text-xs underline font-semibold"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Source thumbnail */}
            {original && (
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
                    src={original}
                    alt="Source shoe"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            )}

            {/* Pipeline info */}
            <div className="bg-[#111] text-white rounded-3xl p-6">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Sparkles size={13} className="text-yellow-400" /> AI Pipeline
              </h3>
              <ol className="space-y-4 text-xs text-white/50">
                {[
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
                ].map(({ n, title, sub, desc }) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-[9px] font-bold flex items-center justify-center shrink-0 text-white/70 mt-0.5">
                      {n}
                    </span>
                    <div>
                      <p className="text-white font-semibold">
                        {title}{" "}
                        <span className="text-white/30 font-normal">
                          ({sub})
                        </span>
                      </p>
                      <p className="mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Studio Canvas */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-black/5 min-h-[620px] flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/15" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/30">
                    Studio Canvas
                  </span>
                  {stage === "done" && (
                    <span className="ml-2 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      ✓ 4K Ready
                    </span>
                  )}
                  {stage === "analyzing" && (
                    <span className="ml-2 text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Step 1 · Groq Vision
                    </span>
                  )}
                  {stage === "generating" && (
                    <span className="ml-2 text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Step 2 · FLUX
                    </span>
                  )}
                </div>
                {generated && (
                  <button
                    onClick={download}
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-black/35 hover:text-black transition-colors"
                  >
                    <Download size={11} /> Download PNG
                  </button>
                )}
              </div>

              <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
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
                          animate={{
                            width: stage === "analyzing" ? "42%" : "92%",
                          }}
                          transition={{
                            duration: stage === "analyzing" ? 5 : 14,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {stage === "done" && generated && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col gap-5"
                    >
                      <div className="grid md:grid-cols-2 gap-5 flex-1">
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
                                onClick={download}
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

                  {stage === "error" && !isProcessing && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <AlertCircle
                        size={40}
                        className="text-red-300 mx-auto mb-3"
                      />
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
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-black/5 flex items-center justify-between">
        <p className="text-xs text-black/25">© 2026 SoleStudio Pro</p>
        <p className="text-xs text-black/20">
          Groq llama-4-scout-17b · FLUX.1-schnell via HuggingFace · Proxied via
          Vite
        </p>
      </footer>
    </div>
  );
}
