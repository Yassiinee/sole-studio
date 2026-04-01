/**
 * API Pipeline
 *
 * Step 1: Groq llama-4-scout-17b-16e (vision) → reads shoe → writes FLUX prompt
 * Step 2: HuggingFace Router → hf-inference provider → FLUX.1-schnell
 *         (hf-inference = HF's own free compute, NOT the paid fal-ai provider)
 *
 * Both endpoints are proxied via Vite to avoid CORS (see vite.config.ts):
 *   /api/groq → https://api.groq.com
 *   /api/hf   → https://router.huggingface.co
 */

const GROQ_URL = "/api/groq/openai/v1/chat/completions";

// router.huggingface.co with hf-inference provider = HF's own GPUs (free tier)
const HF_INFERENCE_URL =
  "/api/hf/hf-inference/models/black-forest-labs/FLUX.1-schnell";

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

/** Step 2: Generate a studio image via HuggingFace direct Inference API (free tier). */
export async function generateStudioImage(
  prompt: string,
  hfToken: string,
): Promise<string> {
  const res = await fetch(HF_INFERENCE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
      "x-wait-for-model": "true", // wait instead of 503 if model is cold
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.json();
      msg =
        (j as any)?.error ||
        (j as any)?.message ||
        JSON.stringify(j).slice(0, 200);
    } catch {
      msg = await res.text().catch(() => "");
    }
    if (res.status === 401)
      throw new Error(
        "Invalid HF_TOKEN — visit huggingface.co/settings/tokens",
      );
    if (res.status === 402)
      throw new Error(
        "This model requires HF Pro credits. Try a different model or upgrade at huggingface.co/pricing",
      );
    if (res.status === 503)
      throw new Error("Model is loading — wait 20 s and try again.");
    throw new Error(
      `HuggingFace ${res.status}: ${String(msg).slice(0, 200)}`,
    );
  }

  // HF Inference API returns raw binary image — convert to data URL
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob."));
    reader.readAsDataURL(blob);
  });
}
