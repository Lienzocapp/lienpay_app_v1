/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built bundle loads correctly from the
  // Capacitor native WebView (Android `file://`/`https://localhost` and iOS
  // `capacitor://localhost`), while remaining valid for the browser demo.
  base: "./",
  plugins: [react()],
  // Vitest configuration integrated with the Vite config so the test
  // toolchain (Vitest + React Testing Library + fast-check) shares the same
  // module resolution and plugins as the app (Design: Technology Choices,
  // Testing Strategy).
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Single-run by default (no watch mode); the `test` script uses
    // `vitest run` so CI and local runs terminate.
    css: false,
  },
});
