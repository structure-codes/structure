import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Run the app with `netlify dev` (serves the API redirects + functions on
    // port 8888). Vite is proxied by the Netlify CLI, so no /api proxy here.
    port: 3000,
  },
});
