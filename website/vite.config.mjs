import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// https://vite.dev/config/
export default defineConfig({
  base: IS_PRODUCTION ? "/playground/" : undefined,
  publicDir: IS_PRODUCTION ? undefined : "./static/",
  plugins: [react()],
  build: {
    outDir: "./static/playground/",
  },
});
