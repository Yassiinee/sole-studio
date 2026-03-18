"use client";
import { useState, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `You are SoleStudio, a professional shoe photography AI. When given a shoe image, you must generate an extremely detailed, technical prompt for creating a professional studio product shot.

Your output must be ONLY a JSON object with this exact structure, no other text:
{
  "prompt": "detailed image generation prompt here",
  "style_notes": "2-3 sentence description of the professional treatment applied",
  "suggested_platform": "Instagram/E-commerce/Lookbook"
}

The prompt must specify:
- Dark grey studio background with subtle vignetting
- Professional 3-point lighting setup with key light, fill, and rim lighting
- Soft directional shadow underneath the shoe
- High-resolution commercial photography aesthetic
- Crisp texture detail on upper materials
- Clean, editorial composition
- Reference the specific shoe model, colorway, and materials you observe in the image
- 4:5 aspect ratio, 1K resolution`;

export default function SoleStudio() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    setResult(null);
    setError(null);
    setGeneratedImageUrl(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result.split(",")[1];
      setImageBase64(b64);
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const generatePrompt = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setGeneratedImageUrl(null);
    try {
      // 1. Ask Groq Vision model to create the professional photography prompt
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: imageMime, data: imageBase64 },
                },
                {
                  type: "text",
                  text: "Analyze this shoe and generate a professional studio photography prompt for it.",
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.content?.find((b) => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);

      // 2. Generate the final 1K image via Pollinations.ai immediately
      if (parsed?.prompt) {
        const encodedPrompt = encodeURIComponent(parsed.prompt);
        // Seed added to bypass extremely rigid caching if needed, but not strictly necessary
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1000&height=1250&nologo=true&enhance=false`;
        setGeneratedImageUrl(imageUrl);
      }

    } catch (err) {
      setError(err.message || "Failed to analyze shoe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = () => {
    if (result?.prompt) {
      navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadImage = async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "solestudio-shot.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error("Failed to download", e);
    }
  };


  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: "#f0ece4" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e1e1e", padding: "0 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#d4f0a0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 9C2 6 4 4 7 3.5C10 3 12 5 12 8" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="7" cy="10.5" rx="5" ry="1.5" fill="#0a0a0a" opacity="0.3" />
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em" }}>SoleStudio</span>
            <span style={{ fontSize: 11, background: "#1e1e1e", color: "#888", padding: "2px 8px", borderRadius: 20, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pro</span>
          </div>
          <nav style={{ display: "flex", gap: 24 }}>
            {["Gallery", "Pricing", "Docs"].map((n) => (
              <span key={n} style={{ fontSize: 13, color: "#666", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.target.style.color = "#f0ece4"}
                onMouseLeave={(e) => e.target.style.color = "#666"}>{n}</span>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 2rem 60px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#d4f0a0", marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>
          AI-POWERED STUDIO PHOTOGRAPHY
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 300, lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 16px", color: "#f0ece4" }}>
          Turn any shoe photo into<br /><em style={{ fontStyle: "italic", color: "#d4f0a0" }}>studio-grade</em> product shots
        </h1>
        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
          Upload your shoe. Get a professional photography brief optimised for commercial use, social media, and premium brand aesthetics.
        </p>
      </section>

      {/* Main Tool */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: image ? "1fr 1fr" : "1fr", gap: 24, transition: "all 0.3s" }}>

          {/* Upload Zone */}
          <div
            onClick={() => !image && fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              background: dragOver ? "#161616" : "#111",
              border: `1px solid ${dragOver ? "#d4f0a0" : "#1e1e1e"}`,
              borderRadius: 16,
              overflow: "hidden",
              cursor: image ? "default" : "pointer",
              transition: "all 0.2s",
              minHeight: 480,
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {image ? (
              <>
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <img src={image} alt="Uploaded shoe" style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 8 }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setImage(null); setImageBase64(null); setResult(null); setError(null); }}
                    style={{ position: "absolute", top: 12, right: 12, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >×</button>
                </div>
                <div style={{ padding: "16px 20px", borderTop: "1px solid #1e1e1e", display: "flex", gap: 12 }}>
                  <button
                    onClick={() => fileRef.current.click()}
                    style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: 10, color: "#888", fontSize: 13, cursor: "pointer" }}
                  >
                    Replace image
                  </button>
                  <button
                    onClick={generatePrompt}
                    disabled={loading}
                    style={{
                      flex: 2, padding: "10px 20px", background: loading ? "#1a1a1a" : "#d4f0a0",
                      border: "none", borderRadius: 10, color: loading ? "#666" : "#0a0a0a",
                      fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                      letterSpacing: "-0.01em", transition: "all 0.2s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid #444", borderTop: "1.5px solid #888", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Analysing...
                      </>
                    ) : "Generate Studio Brief →"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 16 }}>
                <div style={{ width: 64, height: 64, background: "#1a1a1a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 6v12M8 12l6-6 6 6" stroke="#d4f0a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 20v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="#444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 500, margin: "0 0 6px", fontSize: 15 }}>Drop your shoe photo here</p>
                  <p style={{ color: "#555", fontSize: 13, margin: 0 }}>or click to browse · JPG, PNG, WEBP</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {["Studio shots", "Lifestyle photos", "Product flats", "On-feet"].map((tag) => (
                    <span key={tag} style={{ fontSize: 11, color: "#555", border: "1px solid #1e1e1e", padding: "4px 10px", borderRadius: 20 }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          {image && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!result && !loading && !error && (
                <div style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 32 }}>📸</div>
                  <p style={{ color: "#555", fontSize: 14, maxWidth: 260 }}>Hit "Generate Studio Brief" to analyse your shoe and securely create a professional photography shot</p>
                </div>
              )}

              {loading && (
                <div style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 20 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 8, height: 8, background: "#d4f0a0", borderRadius: "50%", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 500, margin: "0 0 4px" }}>Analysing your shoe with Groq Vision...</p>
                    <p style={{ color: "#555", fontSize: 13, margin: 0 }}>This takes just a second</p>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: "#1a0808", border: "1px solid #3a1a1a", borderRadius: 16, padding: 20 }}>
                  <p style={{ color: "#f08080", margin: 0, fontSize: 14 }}>{error}</p>
                </div>
              )}

              {result && (
                <>
                  {/* Generated Final Image Section (New!) */}
                  {generatedImageUrl && (
                    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: 12, color: "#d4f0a0", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>AI Generated Product Shot</p>
                        <button
                          onClick={downloadImage}
                          style={{ background: "#d4f0a0", border: "none", borderRadius: 8, color: "#0a0a0a", fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer", transition: "all 0.2s" }}
                        >
                          Download 1K
                        </button>
                      </div>
                      <div style={{ width: "100%", aspectRatio: "4/5", background: "#0a0a0a", borderRadius: 12, overflow: "hidden", position: "relative" }}>
                        {/* Small loading indicator behind the image while it loads from Pollinations */}
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0 }}>
                          <span style={{ fontSize: 13, color: "#555" }}>Rendering high-res image...</span>
                        </div>
                        {/* The actual image */}
                        <img src={generatedImageUrl} alt="Generated Studio Shot" style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }} />
                      </div>
                    </div>
                  )}

                  {/* Style Badge */}
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "'DM Mono', monospace" }}>Optimised for</p>
                      <p style={{ fontWeight: 500, margin: 0, color: "#d4f0a0" }}>{result.suggested_platform}</p>
                    </div>
                    <div style={{ background: "#1a2a10", border: "1px solid #2a4a18", borderRadius: 8, padding: "6px 12px" }}>
                      <span style={{ fontSize: 11, color: "#a0d070", fontFamily: "'DM Mono', monospace" }}>Powered by Groq</span>
                    </div>
                  </div>

                  {/* Style Notes */}
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "16px 20px" }}>
                    <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "'DM Mono', monospace" }}>Studio treatment</p>
                    <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7, margin: 0 }}>{result.style_notes}</p>
                  </div>

                  {/* Prompt */}
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "16px 20px", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontFamily: "'DM Mono', monospace" }}>Photography prompt</p>
                      <button
                        onClick={copyPrompt}
                        style={{ background: copied ? "#1a2a10" : "transparent", border: `1px solid ${copied ? "#2a4a18" : "#2a2a2a"}`, borderRadius: 8, color: copied ? "#a0d070" : "#666", fontSize: 12, padding: "4px 12px", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        {copied ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.75, margin: 0, fontFamily: "'DM Mono', monospace", background: "#0a0a0a", padding: 16, borderRadius: 10, border: "1px solid #1a1a1a" }}>
                      {result.prompt}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sample Gallery */}
        {!image && (
          <div style={{ marginTop: 60 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontFamily: "'DM Mono', monospace", textAlign: "center" }}>
              Supported shoe types
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Running", icon: "👟", desc: "Road & trail" },
                { label: "Lifestyle", icon: "✨", desc: "Streetwear & casual" },
                { label: "Basketball", icon: "🏀", desc: "Court & retro" },
                { label: "Boots", icon: "🥾", desc: "Work & fashion" },
              ].map((c) => (
                <div key={c.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                  <p style={{ fontWeight: 500, margin: "0 0 4px", fontSize: 14 }}>{c.label}</p>
                  <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
    </div>
  );
}
