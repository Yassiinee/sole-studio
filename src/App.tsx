/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ImageState {
  original: string | null;
  transformed: string | null;
  isLoading: boolean;
  error: string | null;
  status: string;
}

export default function App() {
  const [state, setState] = useState<ImageState>({
    original: null,
    transformed: null,
    isLoading: false,
    error: null,
    status: 'idle'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: 'Please upload a valid image file.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setState({
        original: e.target?.result as string,
        transformed: null,
        isLoading: false,
        error: null,
        status: 'ready'
      });
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const transformImage = async () => {
    if (!state.original) return;

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      status: 'Analyzing details and setting up the studio...' 
    }));

    try {
      const base64Data = state.original.split(',')[1];
      const mimeType = state.original.split(';')[0].split(':')[1];

      const loadingMessages = [
        "Analyzing shoe geometry...",
        "Removing background precisely...",
        "Setting up professional studio lighting...",
        "Applying 4K texture enhancements...",
        "Finalizing professional grey background...",
        "Polishing shadows for realism..."
      ];

      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setState(prev => ({ ...prev, status: loadingMessages[messageIndex] }));
      }, 2500);

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Transform this shoe into a professional product shot. Place it on a clean, professional grey studio background with realistic soft shadows and studio lighting. Ensure high-quality 4K details, sharp edges, and a premium commercial aesthetic suitable for high-end social media marketing. The shoe should be the absolute central focus, looking brand new and professionally lit.',
            },
          ],
        },
      });

      clearInterval(interval);

      let transformedUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          transformedUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (transformedUrl) {
        setState(prev => ({
          ...prev,
          transformed: transformedUrl,
          isLoading: false,
          status: 'Transformation complete!'
        }));
      } else {
        throw new Error("Model didn't return an image. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'An error occurred during transformation.',
        status: 'error'
      }));
    }
  };

  const downloadImage = () => {
    if (!state.transformed) return;
    const link = document.createElement('a');
    link.href = state.transformed;
    link.download = 'solestudio-pro-shoe.png';
    link.click();
  };

  const reset = () => {
    setState({
      original: null,
      transformed: null,
      isLoading: false,
      error: null,
      status: 'idle'
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Camera size={20} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">SoleStudio <span className="text-black/40 font-medium">Pro</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-semibold">Professional Shoe Photography AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={reset}
              className="text-sm font-medium text-black/60 hover:text-black transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Controls & Upload */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
              <h2 className="text-2xl font-semibold mb-2">Upload Photo</h2>
              <p className="text-black/50 text-sm mb-8">Take a photo of your shoe in any environment. We'll handle the rest.</p>

              <div 
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer
                  flex flex-col items-center justify-center text-center
                  ${state.original ? 'border-green-500/30 bg-green-50/30' : 'border-black/10 hover:border-black/30 hover:bg-black/[0.02]'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {state.original ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="text-sm font-medium text-green-700">Image Uploaded</span>
                    <button className="text-xs text-black/40 mt-2 hover:text-black underline">Change Image</button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-4">
                      <Upload size={20} className="text-black/40" />
                    </div>
                    <p className="text-sm font-medium">Click or drag & drop</p>
                    <p className="text-xs text-black/40 mt-1">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>

              <AnimatePresence>
                {state.original && !state.transformed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-8"
                  >
                    <button
                      onClick={transformImage}
                      disabled={state.isLoading}
                      className="w-full bg-black text-white h-14 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {state.isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Transform to Pro Shot</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {state.error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">{state.error}</p>
                </div>
              )}
            </section>

            <section className="bg-black text-white rounded-3xl p-8 shadow-xl overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
                <ul className="space-y-4 text-sm text-white/60">
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white shrink-0">1</span>
                    <p>Ensure the shoe is fully visible in the frame.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white shrink-0">2</span>
                    <p>Good natural lighting helps the AI detect textures better.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white shrink-0">3</span>
                    <p>Try different angles for more dynamic social media posts.</p>
                  </li>
                </ul>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </section>
          </div>

          {/* Right Column: Preview Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-black/5 min-h-[600px] flex flex-col">
              
              {/* Preview Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-black/20"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-black/40">Studio Canvas</span>
                </div>
                {state.transformed && (
                  <button 
                    onClick={downloadImage}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-black transition-colors text-black/60"
                  >
                    <Download size={14} />
                    Download 4K
                  </button>
                )}
              </div>

              {/* Canvas Area */}
              <div className="flex-1 relative overflow-hidden rounded-2xl bg-[#FAFAFA] flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                  {!state.original && !state.isLoading && (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ImageIcon size={32} className="text-black/20" />
                      </div>
                      <p className="text-black/30 font-medium">Your masterpiece will appear here</p>
                    </motion.div>
                  )}

                  {state.isLoading && (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center max-w-xs"
                    >
                      <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-black/5 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw size={24} className="text-black animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Transforming...</h3>
                      <p className="text-sm text-black/40 h-10 italic leading-relaxed">
                        {state.status}
                      </p>
                    </motion.div>
                  )}

                  {state.original && !state.isLoading && (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col gap-8"
                    >
                      <div className="grid md:grid-cols-2 gap-8 h-full">
                        {/* Original */}
                        <div className="flex flex-col gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">Source Image</span>
                          <div className="relative aspect-square rounded-2xl overflow-hidden border border-black/5 bg-white shadow-inner">
                            <img 
                              src={state.original} 
                              alt="Original" 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {/* Transformed */}
                        <div className="flex flex-col gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">Pro Result</span>
                          <div className="relative aspect-square rounded-2xl overflow-hidden border border-black/5 bg-[#E5E5E5] shadow-2xl group">
                            {state.transformed ? (
                              <>
                                <img 
                                  src={state.transformed} 
                                  alt="Transformed" 
                                  className="w-full h-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button 
                                    onClick={downloadImage}
                                    className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform"
                                  >
                                    <Download size={16} />
                                    Download High-Res
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-black/20">
                                <ImageIcon size={48} className="mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Ready to Transform</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Info */}
              <div className="px-8 py-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
                <span>4K Resolution Ready</span>
                <div className="flex items-center gap-4">
                  <span>Studio Grey BG</span>
                  <div className="w-1 h-1 rounded-full bg-black/20"></div>
                  <span>Professional Lighting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs text-black/40">© 2026 SoleStudio Pro. Powered by Gemini Vision AI.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">Privacy</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">Terms</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
