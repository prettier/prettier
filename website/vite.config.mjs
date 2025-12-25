import path from "node:path";
import { fileURLToPath } from "node:url";
import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_CI = Boolean(process.env.CI);

export default defineConfig({
  base: IS_PRODUCTION ? "/playground/" : undefined,
  publicDir: IS_PRODUCTION ? undefined : "./static/",
  plugins: [vitePluginVue(), vitePluginVueJsx()],
  resolve: {
    // Dedupe packages to avoid duplicate instances
    alias: {
      "@codemirror/state": path.resolve(
        __dirname,
        "node_modules/@codemirror/state",
      ),
      "@codemirror/view": path.resolve(
        __dirname,
        "node_modules/@codemirror/view",
      ),
      "@codemirror/language": path.resolve(
        __dirname,
        "node_modules/@codemirror/language",
      ),
    },
  },
  build: {
    outDir: "./static/playground/",
    minify: IS_CI,
  },
});
