export type Stage = "idle" | "ready" | "analyzing" | "generating" | "done" | "error";

export interface AppState {
  original: string | null;
  generated: string | null;
  fluxPrompt: string | null;
  stage: Stage;
  statusMsg: string;
  error: string | null;
}
