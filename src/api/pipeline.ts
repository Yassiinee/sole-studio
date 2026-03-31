/**
 * API Pipeline
 *
 * Step 1: Groq llama-4-scout-17b-16e (vision) → reads shoe → writes FLUX prompt
 * Step 2: HuggingFace router → fal-ai FLUX.1-schnell → 1024×1024 studio photo
 *
 * Both endpoints are proxied via Vite to avoid CORS (see vite.config.ts):
 *   /api/groq → https://api.groq.com
 *   /api/hf   → https://router.huggingface.co
 */

const GROQ_URL = "/api/groq/openai/v1/chat/completions";
const HF_URL = "/api/hf/fal-ai/flux/schnell";

/** Step 1: Send shoe image to Groq Vision and receive a tailored FLUX prompt. */
export async function buildFluxPrompt(
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
    throw new Error((err as any)?.error?.message || `Groq error ${res.status}`);
  }

  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text)
    throw new Error("Groq returned an empty prompt — please try again.");
  return text;
}

/** Step 2: Generate a 1024×1024 studio image via fal-ai FLUX.1-schnell through HuggingFace. */
export async function generateStudioImage(
  prompt: string,
  hfToken: string,
): Promise<string> {
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
      msg = (j as any)?.detail || (j as any)?.error || JSON.stringify(j);
    } catch {
      msg = await res.text().catch(() => "");
    }
    if (res.status === 401)
      throw new Error(
        "Invalid HF_TOKEN — check huggingface.co/settings/tokens",
      );
    if (res.status === 402)
      throw new Error(
        "HuggingFace: pre-paid credits required for fal-ai provider.",
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
