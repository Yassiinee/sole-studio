import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.GROQ_API_KEY": JSON.stringify(env.GROQ_API_KEY),
      "process.env.HF_TOKEN": JSON.stringify(env.HF_TOKEN),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      proxy: {
        // Proxies /api/groq/* → https://api.groq.com/*
        // This avoids CORS — the request goes via Vite dev server, not the browser
        "/api/groq": {
          target: "https://api.groq.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/groq/, ""),
        },
        // Proxies /api/hf/* → https://router.huggingface.co/*
        "/api/hf": {
          target: "https://router.huggingface.co",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hf/, ""),
        },
      },
    },
  };
});
