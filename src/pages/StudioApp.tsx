import React, { useState, useRef } from "react";
import { AppState } from "../types";
import { processStudioImage } from "../api/pipeline";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import UploadZone from "../components/UploadZone";
import ErrorBanner from "../components/ErrorBanner";
import SourceThumbnail from "../components/SourceThumbnail";
import { CopyCheck, Download, Wand2 } from "lucide-react";

export default function StudioApp() {
  const [original, setOriginal] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [stage, setStage] = useState<AppState["stage"]>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Custom Studio Color
  const [bgColor, setBgColor] = useState<string>("#5A5A5C");

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      setStage("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginal(e.target?.result as string);
      setGenerated(null);
      setStage("ready");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // ── Single Step: Exact Compositing ────────────────────────────────────────
  const runGeneration = async () => {
    if (!original) {
      setError("Please upload a shoe photo first.");
      setStage("error");
      return;
    }

    setStage("generating");
    setError(null);
    setGenerated(null);

    try {
      const resultDataUrl = await processStudioImage(
        original,
        bgColor,
        (msg) => {
          setStatusMsg(msg);
        },
      );

      setGenerated(resultDataUrl);
      setStage("done");
      setStatusMsg("");
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred during processing.",
      );
      setStage("error");
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const download = async () => {
    if (!generated) return;
    try {
      if (generated.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = generated;
        a.download = "solestudio-exact-4k.jpg";
        a.click();
      } else {
        const res = await fetch(generated);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "solestudio-exact-4k.jpg";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      window.open(generated, "_blank");
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setOriginal(null);
    setGenerated(null);
    setStage("idle");
    setStatusMsg("");
    setError(null);
  };

  const isProcessing = stage === "generating" || stage === "analyzing";

  return (
    <div className="min-h-screen bg-[#EDEDEB] text-[#111] font-sans flex flex-col">
      <AppHeader onReset={reset} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8 h-full">
          {/* ── Left panel ─────────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold mb-1">Upload Shoe Photo</h2>
              <p className="text-black/40 text-sm mb-5 leading-relaxed">
                We use precise AI background segmentation to protect 100% of
                your shoe's original details, placing it perfectly on a 4K
                studio sweep.
              </p>

              <UploadZone hasFile={!!original} onFile={handleFile} />

              {original && stage !== "done" && (
                <div className="mt-6 border border-black/10 rounded-2xl p-4 bg-black/[0.02]">
                  <p className="text-sm font-semibold mb-3">
                    Studio Backdrop Color
                  </p>
                  <div className="flex items-center gap-3">
                    {[
                      { name: "Pro Grey", hex: "#5A5A5C" },
                      { name: "Light Sweep", hex: "#E8E8E8" },
                      { name: "Dark Charcoal", hex: "#222222" },
                      { name: "Pure White", hex: "#FFFFFF" },
                      { name: "Blush Pink", hex: "#F3E8EC" },
                    ].map((swatch) => (
                      <button
                        key={swatch.name}
                        title={swatch.name}
                        onClick={() => setBgColor(swatch.hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          bgColor === swatch.hex
                            ? "border-orange-500 scale-110 shadow-md"
                            : "border-black/10"
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                    <div className="w-px h-6 bg-black/10 mx-1" />
                    <label
                      title="Custom Color"
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 overflow-hidden ${
                        ![
                          "#5A5A5C",
                          "#E8E8E8",
                          "#222222",
                          "#FFFFFF",
                          "#F3E8EC",
                        ].includes(bgColor)
                          ? "border-orange-500 scale-110 shadow-md"
                          : "border-black/10"
                      }`}
                      style={{ backgroundColor: bgColor }}
                    >
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {original && stage !== "done" && (
                <button
                  onClick={runGeneration}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-black text-white hover:bg-neutral-800 disabled:bg-black/20 disabled:text-white/50 transition-colors py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="flex animate-pulse items-center gap-2">
                      <Wand2 size={18} />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      Generate Studio Asset
                    </>
                  )}
                </button>
              )}

              {stage === "done" && (
                <button
                  onClick={download}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90 transition-opacity py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <Download size={18} />
                  Download 4K Asset
                </button>
              )}

              {error && (
                <div className="mt-4">
                  <ErrorBanner message={error} onRetry={runGeneration} />
                </div>
              )}
            </div>

            {original && <SourceThumbnail src={original} />}

            <div className="bg-white/50 border border-black/5 rounded-2xl p-5 text-sm text-black/60">
              <div className="flex items-center gap-2 mb-2 font-medium text-black">
                <CopyCheck size={16} className="text-green-600" />
                Exact-Detail Mode Active
              </div>
              Your original image pixels are perfectly preserved. We only
              intelligently strip the background and inject physics-based drop
              shadows.
            </div>
          </div>

          {/* ── Right panel — Studio Canvas ────────────────────────────── */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm relative min-h-[600px] flex items-center justify-center">
            {!original && (
              <div className="text-center text-black/30 flex flex-col items-center">
                <Wand2 size={48} className="mb-4 opacity-50" />
                <p className="font-medium">
                  Upload a photo to see the studio preview
                </p>
              </div>
            )}

            {original && !generated && !isProcessing && (
              <img
                src={original}
                className="max-w-full max-h-full object-contain opacity-50 p-8"
                alt="Original Preview"
              />
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mb-6" />
                <p className="font-mono text-sm tracking-widest uppercase font-bold text-black/70 animate-pulse">
                  {statusMsg || "Processing pixels..."}
                </p>
              </div>
            )}

            {generated && (
              <img
                src={generated}
                className="w-full h-full object-cover transition-opacity duration-700 opacity-100"
                alt="Generated Studio Asset"
              />
            )}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
