import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:3333';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        '^/m(?:/|$)': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
