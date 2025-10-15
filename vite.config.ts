import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "zustand"],
    force: true,
  },

  server: {
    // ⚡ Trick: chạy song song trên cả 127.0.0.1 và 0.0.0.0
    host: "127.0.0.1", // để localhost hoạt động
    port: 8080,
    strictPort: true,

    // ⚡ Cho phép DevTunnel proxy qua
    allowedHosts: ["localhost", "127.0.0.1", "*.asse.devtunnels.ms"],

    // ⚡ Thêm proxy network nếu cần
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
  },
}));
