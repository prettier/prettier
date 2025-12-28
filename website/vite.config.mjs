import path from "node:path";
import { fileURLToPath } from "node:url";
import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { visualizer as rollupPluginVisualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_CI = Boolean(process.env.CI);

export default defineConfig({
  base: IS_PRODUCTION ? "/playground/" : undefined,
  publicDir: IS_PRODUCTION ? undefined : "./static/",
  plugins: [
    vitePluginVue(),
    vitePluginVueJsx(),
    IS_CI || !IS_PRODUCTION
      ? undefined
      : rollupPluginVisualizer({ filename: "./static/playground/report.html" }),
  ].filter(Boolean),
  resolve: {
    // Dedupe packages to avoid duplicate instances
    alias: {
      "@codemirror/view": path.resolve(
        __dirname,
        "node_modules/@codemirror/view",
      ),
    },
  },
  build: {
    outDir: "./static/playground/",
    minify: IS_CI,
  },
});
