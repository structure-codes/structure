/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Run the app with `netlify dev` (serves the API + functions on port 8888).
    // Vite is proxied by the Netlify CLI, so no /api proxy here.
    port: 3000,
  },
  test: {
    globals: true,
    // Client (src) tests run against jsdom; the Netlify functions run on Node.
    environment: "jsdom",
    // Give jsdom a real origin so the app's relative `fetch("/api/...")` calls
    // resolve to an absolute URL that msw can intercept.
    environmentOptions: { jsdom: { url: "http://localhost:3000/" } },
    environmentMatchGlobs: [["netlify/**", "node"]],
    setupFiles: ["./src/setupTests.ts"],
  },
});
