import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// https://vite.dev/config/
export default defineConfig({
  base: IS_PRODUCTION ? "/playground/" : undefined,
  publicDir: IS_PRODUCTION ? undefined : "./static/",
  plugins: [vue()],
  build: {
    outDir: "./static/playground/",
  },
});
