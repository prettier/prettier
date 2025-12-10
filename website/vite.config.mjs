import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig } from "vite";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_CI = Boolean(process.env.CI);

// https://vite.dev/config/
export default defineConfig({
  base: IS_PRODUCTION ? "/playground/" : undefined,
  publicDir: IS_PRODUCTION ? undefined : "./static/",
  plugins: [vitePluginVue(), vitePluginVueJsx()],
  build: {
    outDir: "./static/playground/",
    minify: IS_CI,
  },
});
