export type Stage =
  | "idle"
  | "ready"
  | "analyzing"   // Step 1 running — Groq Vision
  | "analyzed"    // Step 1 done — prompt ready, waiting for user to trigger Step 2
  | "generating"  // Step 2 running — FLUX image generation
  | "done"
  | "error";

export interface AppState {
  original: string | null;
  generated: string | null;
  fluxPrompt: string | null;
  stage: Stage;
  statusMsg: string;
  error: string | null;
}
