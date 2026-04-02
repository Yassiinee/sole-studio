import React, { useState, useRef } from "react";
import { AppState } from "../types";
import { buildFluxPrompt, generateStudioImage } from "../api/pipeline";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import UploadZone from "../components/UploadZone";
import PromptViewer from "../components/PromptViewer";
import ActionButtons from "../components/ActionButtons";
import ErrorBanner from "../components/ErrorBanner";
import SourceThumbnail from "../components/SourceThumbnail";
import PipelineInfo from "../components/PipelineInfo";
import StudioCanvas from "../components/StudioCanvas";

const INITIAL_STATE: AppState = {
  original: null,
  generated: null,
  fluxPrompt: null,
  stage: "idle",
  statusMsg: "",
  error: null,
};

export default function StudioApp() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Ticker helpers ────────────────────────────────────────────────────────
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

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setState((p) => ({
        ...p,
        error: "Please upload a valid image file.",
        stage: "error",
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) =>
      setState((p) => ({
        ...p,
        original: e.target?.result as string,
        generated: null,
        fluxPrompt: null,
        stage: "ready",
        error: null,
      }));
    reader.readAsDataURL(file);
  };

  // ── Step 1: Groq Vision → FLUX prompt ────────────────────────────────────
  const runStep1 = async () => {
    const groqKey = (process.env as any).GROQ_API_KEY;

    if (!groqKey)
      return setState((p) => ({
        ...p,
        stage: "error",
        error: "GROQ_API_KEY missing from .env",
      }));
    if (!state.original)
      return setState((p) => ({
        ...p,
        stage: "error",
        error: "Please upload a shoe photo first.",
      }));

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
    // Step 1 complete — surface the prompt, wait for user to trigger Step 2
    setState((p) => ({
      ...p,
      stage: "analyzed",
      fluxPrompt: prompt,
      statusMsg: "",
    }));
  };

  // ── Step 2: FLUX generation ───────────────────────────────────────────────
  const runStep2 = async () => {
    const hfToken = (process.env as any).HF_TOKEN;

    if (!hfToken)
      return setState((p) => ({
        ...p,
        stage: "error",
        error: "HF_TOKEN missing from .env",
      }));
    if (!state.fluxPrompt)
      return setState((p) => ({
        ...p,
        stage: "error",
        error: "No FLUX prompt found — run Step 1 first.",
      }));

    setState((p) => ({ ...p, stage: "generating", error: null }));
    startTicker([
      "Calling HuggingFace FLUX.1-schnell...",
      "Diffusing light grey studio backdrop...",
      "Rendering shoe geometry & textures...",
      "Painting soft ground shadow...",
      "Applying studio lighting pass...",
      "Finalising 4K commercial shot...",
    ]);

    let imageUrl: string;
    try {
      imageUrl = await generateStudioImage(state.fluxPrompt, hfToken);
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

  // ── Download ──────────────────────────────────────────────────────────────
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

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    stopTicker();
    setState(INITIAL_STATE);
  };

  const { original, generated, fluxPrompt, stage, statusMsg, error } = state;
  const isProcessing = stage === "analyzing" || stage === "generating";

  return (
    <div className="min-h-screen bg-[#EDEDEB] text-[#111] font-sans">
      <AppHeader onReset={reset} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* ── Left panel ─────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold mb-1">Upload Shoe Photo</h2>
              <p className="text-black/40 text-sm mb-5">
                Groq Vision reads your shoe and writes a tailored FLUX prompt
                automatically.
              </p>

              <UploadZone hasFile={!!original} onFile={handleFile} />
              <PromptViewer prompt={fluxPrompt} />
              <ActionButtons
                stage={stage}
                isProcessing={isProcessing}
                hasFile={!!original}
                onStep1={runStep1}
                onStep2={runStep2}
                onDownload={download}
              />
              {error && (
                <ErrorBanner
                  message={error}
                  onRetry={stage === "analyzed" ? runStep2 : runStep1}
                />
              )}
            </div>

            {original && <SourceThumbnail src={original} />}
            <PipelineInfo />
          </div>

          {/* ── Right panel — Studio Canvas ────────────────────────────── */}
          <div className="lg:col-span-8">
            <StudioCanvas
              stage={stage}
              isProcessing={isProcessing}
              statusMsg={statusMsg}
              original={original}
              generated={generated}
              fluxPrompt={fluxPrompt}
              onGenerate={runStep2}
              onDownload={download}
            />
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
