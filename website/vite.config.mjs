import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { visualizer as rollupPluginVisualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

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
  build: {
    outDir: "./static/playground/",
    minify: IS_CI,
  },
});
