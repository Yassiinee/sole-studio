/**
 * SoleStudio Pro
 * Image generation via Puter.js — free, no API key, works from the browser.
 * Puter.js loads from CDN via a <script> tag in index.html:
 *   <script src="https://js.puter.com/v2/"></script>
 *
 * Users sign in with their free Puter account on first use.
 * No .env changes needed — remove HF_TOKEN entirely.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Camera, CheckCircle2, AlertCircle,
  ChevronRight, Sparkles, Download, RefreshCw,
  Image as ImageIcon, Zap, Edit3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

declare global {
  interface Window {
    puter: any;
  }
}

// ─── Studio prompt template ───────────────────────────────────────────────────
const BASE_PROMPT =
  'A single sneaker shoe product photo, placed on a smooth seamless light grey (#E8E8E8) studio paper sweep backdrop, ' +
  'soft diffused professional studio lighting from both sides with gentle front fill light, ' +
  'razor-sharp focus on every stitch texture and material detail, ' +
  'perfect soft natural shadow directly beneath the shoe on the ground, ' +
  '3/4 angle view from front-left, shoe slightly elevated, ' +
  'commercial ecommerce product photography, 4K ultra-detailed, hyperrealistic, photographic, ' +
  'clean minimal background, professional shoe brand campaign shoot, no text, no watermark';

type Stage = 'idle' | 'ready' | 'generating' | 'done' | 'error';

interface AppState {
  original: string | null;
  generated: string | null;
  stage: Stage;
  statusMsg: string;
  error: string | null;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    original: null, generated: null,
    stage: 'idle', statusMsg: '', error: null,
  });
  const [prompt, setPrompt] = useState(BASE_PROMPT);
  const [showPrompt, setShowPrompt] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load Puter.js from CDN dynamically
  useEffect(() => {
    if (window.puter) { setPuterReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => setPuterReady(true);
    script.onerror = () => console.error('Failed to load Puter.js');
    document.head.appendChild(script);
  }, []);

  const startTicker = (msgs: string[]) => {
    let i = 0;
    setState(p => ({ ...p, statusMsg: msgs[0] }));
    tickerRef.current = setInterval(() => {
      i = (i + 1) % msgs.length;
      setState(p => ({ ...p, statusMsg: msgs[i] }));
    }, 2200);
  };
  const stopTicker = () => {
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setState(p => ({ ...p, error: 'Please upload a valid image file.', stage: 'error' }));
      return;
    }
    const r = new FileReader();
    r.onload = e => setState(p => ({
      ...p, original: e.target?.result as string,
      generated: null, stage: 'ready', error: null,
    }));
    r.readAsDataURL(file);
  };

  const run = async () => {
    if (!puterReady || !window.puter) {
      setState(p => ({ ...p, stage: 'error', error: 'Puter.js is still loading. Please wait a moment and try again.' }));
      return;
    }

    setState(p => ({ ...p, stage: 'generating', error: null, generated: null }));
    startTicker([
      'Connecting to Puter FLUX model...',
      'Diffusing light grey studio backdrop...',
      'Rendering shoe geometry & textures...',
      'Painting soft ground shadow...',
      'Applying studio lighting pass...',
      'Finalising 4K commercial shot...',
    ]);

    try {
      // puter.ai.txt2img returns a blob URL
      const result = await window.puter.ai.txt2img(prompt, false, 'flux-schnell');

      stopTicker();

      // result is an <img> element or a URL string depending on Puter version
      let imageUrl: string;
      if (typeof result === 'string') {
        imageUrl = result;
      } else if (result instanceof HTMLImageElement) {
        imageUrl = result.src;
      } else if (result?.src) {
        imageUrl = result.src;
      } else {
        throw new Error('Unexpected response from Puter.js — try again.');
      }

      setState(p => ({ ...p, stage: 'done', generated: imageUrl, statusMsg: '' }));
    } catch (err: any) {
      stopTicker();
      const msg = err?.message || String(err) || 'Generation failed.';
      setState(p => ({ ...p, stage: 'error', error: msg }));
    }
  };

  const download = async () => {
    const { generated } = state;
    if (!generated) return;
    try {
      const res = await fetch(generated);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'solestudio-4k.png'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(generated, '_blank');
    }
  };

  const reset = () => {
    stopTicker();
    setState({ original: null, generated: null, stage: 'idle', statusMsg: '', error: null });
  };

  const { original, generated, stage, statusMsg, error } = state;
  const isGenerating = stage === 'generating';

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
                SoleStudio <span className="text-black/30 font-normal">Pro</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/30 mt-0.5">
                FLUX.1-schnell · Puter.js · Free · No Key
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${puterReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">
              {puterReady ? 'Ready' : 'Loading...'}
            </span>
            <button onClick={reset} className="text-xs font-semibold text-black/35 hover:text-black border border-black/10 rounded-xl px-3 py-1.5 transition-colors ml-2">
              Start Over
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left panel */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold mb-1">Upload Reference</h2>
              <p className="text-black/40 text-sm mb-5">
                Optional reference photo. Generation is prompt-based via FLUX.
              </p>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-7 cursor-pointer transition-all flex flex-col items-center text-center
                  ${original ? 'border-emerald-400/40 bg-emerald-50/25' : 'border-black/10 hover:border-black/25 hover:bg-black/[0.015]'}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
                {original ? (
                  <>
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">Reference uploaded</span>
                    <span className="text-xs text-black/30 mt-1 underline">Change</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center mb-2">
                      <Upload size={17} className="text-black/35" />
                    </div>
                    <p className="text-sm font-semibold">Click or drag & drop</p>
                    <p className="text-xs text-black/35 mt-0.5">PNG · JPG · WEBP (optional)</p>
                  </>
                )}
              </div>

              {/* Prompt editor */}
              <div className="mt-5">
                <button
                  onClick={() => setShowPrompt(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-black/8 hover:border-black/20 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm text-black/60 font-semibold">
                    <Edit3 size={14} /> Edit Prompt
                  </span>
                  <span className="text-[10px] text-black/30 font-bold uppercase tracking-widest">
                    {showPrompt ? 'Hide' : 'Customize'}
                  </span>
                </button>
                <AnimatePresence>
                  {showPrompt && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={7}
                        className="w-full mt-3 p-4 text-xs font-mono leading-relaxed bg-black/3 border border-black/8 rounded-2xl resize-none focus:outline-none focus:border-black/20 text-black/70"
                      />
                      <button onClick={() => setPrompt(BASE_PROMPT)} className="mt-1 text-xs text-black/35 hover:text-black underline transition-colors">
                        Reset to default
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <div className="mt-5">
                {stage === 'done' ? (
                  <div className="flex gap-3">
                    <button onClick={run} className="flex-1 border-2 border-black/10 rounded-2xl py-3.5 text-sm font-semibold text-black/45 hover:text-black hover:border-black/25 flex items-center justify-center gap-2 transition-all">
                      <RefreshCw size={13} /> Regenerate
                    </button>
                    <button onClick={download} className="flex-1 bg-black text-white rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.015] transition-all">
                      <Download size={13} /> Download
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={run}
                    disabled={isGenerating || !puterReady}
                    className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.015] active:scale-[0.985] transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isGenerating
                      ? <><Zap size={16} className="animate-pulse text-yellow-400" /> Generating...</>
                      : <><Zap size={16} className="text-yellow-400" /> Generate 4K Studio Shot <ChevronRight size={14} /></>}
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-2.5 text-red-600">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold mb-1">Error</p>
                    <p className="text-xs leading-relaxed">{error}</p>
                    <button onClick={run} className="mt-2 text-xs underline font-semibold">Try again</button>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail */}
            {original && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-4 border border-black/5 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/28 mb-3 px-1">Your Reference</p>
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F5F5]">
                  <img src={original} alt="Reference" className="w-full h-full object-contain" />
                </div>
              </motion.div>
            )}

            {/* Info */}
            <div className="bg-[#111] text-white rounded-3xl p-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Sparkles size={13} className="text-yellow-400" /> How it works
              </h3>
              <ul className="space-y-2 text-xs text-white/50">
                {[
                  { t: 'Free via Puter.js — no API key needed', c: 'text-yellow-400' },
                  { t: 'Sign in with free Puter account on first use', c: 'text-white/40' },
                  { t: 'FLUX.1-schnell model for best quality', c: 'text-white/40' },
                  { t: 'Light grey #E8E8E8 seamless backdrop', c: 'text-white/40' },
                  { t: 'Soft diffused studio lighting', c: 'text-white/40' },
                  { t: '1024×1024 — ready to post', c: 'text-white/40' },
                ].map(({ t, c }, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`${c} mt-0.5 shrink-0`}>✓</span><span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Studio Canvas */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-black/5 min-h-[620px] flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/15" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/30">Studio Canvas</span>
                  {stage === 'done' && (
                    <span className="ml-2 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">✓ 4K Ready</span>
                  )}
                </div>
                {generated && (
                  <button onClick={download} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-black/35 hover:text-black transition-colors">
                    <Download size={11} /> Download PNG
                  </button>
                )}
              </div>

              <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                  {(stage === 'idle' || stage === 'ready') && !generated && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                      <div className="w-20 h-20 bg-black/4 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <ImageIcon size={28} className="text-black/15" />
                      </div>
                      <p className="font-semibold text-black/20">Your 4K studio shot appears here</p>
                      <p className="text-xs text-black/13 mt-1">
                        {puterReady ? 'Hit Generate — no API key needed' : 'Loading Puter.js...'}
                      </p>
                    </motion.div>
                  )}

                  {isGenerating && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center max-w-sm">
                      <div className="relative w-24 h-24 mb-7">
                        <div className="absolute inset-0 rounded-full border-4 border-black/5" />
                        <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin" />
                        <Zap size={22} className="absolute inset-0 m-auto text-yellow-500 animate-pulse" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/30 mb-1">FLUX.1-schnell · Puter.js</span>
                      <h3 className="text-base font-bold mb-2">Generating studio shot...</h3>
                      <p className="text-sm text-black/35 italic h-10 leading-relaxed">{statusMsg}</p>
                      <div className="mt-6 w-64 h-1.5 bg-black/8 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-black rounded-full"
                          initial={{ width: '5%' }} animate={{ width: '88%' }}
                          transition={{ duration: 18, ease: 'easeOut' }} />
                      </div>
                    </motion.div>
                  )}

                  {stage === 'done' && generated && (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full flex flex-col gap-5">
                      <div className={`grid ${original ? 'md:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto w-full'} gap-5 flex-1`}>
                        {original && (
                          <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/28 px-1">Reference</span>
                            <div className="flex-1 aspect-square rounded-2xl overflow-hidden border border-black/5 bg-[#F5F5F5]">
                              <img src={original} alt="Reference" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 px-1">4K Studio Result</span>
                          <div className="flex-1 aspect-square rounded-2xl overflow-hidden border border-black/5 bg-[#E8E8E8] relative group shadow-xl">
                            <img src={generated} alt="Studio shot" className="w-full h-full object-contain" crossOrigin="anonymous" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={download} className="bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 translate-y-3 group-hover:translate-y-0 transition-transform">
                                <Download size={14} /> Download 4K
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {stage === 'error' && !isGenerating && (
                    <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                      <AlertCircle size={40} className="text-red-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-black/35">Generation failed</p>
                      <p className="text-xs text-black/22 mt-1">Check the error on the left and try again</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-6 py-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] text-black/22">
                <span>FLUX.1-schnell · Puter.js · 1024×1024</span>
                <div className="flex items-center gap-3">
                  <span>Grey #E8E8E8</span>
                  <div className="w-1 h-1 rounded-full bg-black/15" />
                  <span>Studio Lighting</span>
                  <div className="w-1 h-1 rounded-full bg-black/15" />
                  <span>Free · No Key</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-black/5 flex items-center justify-between">
        <p className="text-xs text-black/25">© 2026 SoleStudio Pro</p>
        <p className="text-xs text-black/20">FLUX.1-schnell · Puter.js · Free</p>
      </footer>
    </div>
  );
}