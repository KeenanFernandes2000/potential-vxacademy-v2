import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5000, // 👈 set your port here
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
    define: {
      // Only expose specific environment variables to the client for security
      "process.env.VITE_FRONTEND_URL": JSON.stringify(env.VITE_FRONTEND_URL),
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
  };
});
