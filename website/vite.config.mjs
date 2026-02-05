import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { visualizer as rollupPluginVisualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { getPackageDependencies } from "./scripts/collect-dependencies.mjs";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_CI = Boolean(process.env.CI);
const OUT_DIRECTORY = "./static/playground/";
const cdnDependencies = {
  file: new URL("./package.json", import.meta.url),
  exclude: new Set([
    "@docusaurus/preset-classic",
    "@docusaurus/plugin-content-docs",
  ]),
  overrideDependencies: new Map([
    // We don't need deps from `vue`
    ["vue", []],
  ]),
  ignoreDependencies: (name) => name.startsWith("@types/"),
};

// Local develop requires `vue` for HMR
if (!IS_PRODUCTION) {
  cdnDependencies.exclude.add("vue");
}

const alias = buildCdnAlias();

export default defineConfig({
  base: IS_PRODUCTION ? "/playground/" : undefined,
  publicDir: IS_PRODUCTION ? undefined : "./static/",
  plugins: [
    vitePluginVue(),
    vitePluginVueJsx(),
    IS_CI || !IS_PRODUCTION
      ? undefined
      : rollupPluginVisualizer({
          filename: `${OUT_DIRECTORY}bundle-report.html`,
        }),
  ].filter(Boolean),
  resolve: {
    alias,
  },
  build: {
    outDir: OUT_DIRECTORY,
    minify: IS_CI,
  },
});

function buildCdnAlias() {
  if (!IS_PRODUCTION) {
    return;
  }

  return Object.fromEntries(
    getPackageDependencies(cdnDependencies).map(
      ({ name, packageJson, dependencies }) => {
        const url = new URL(
          `https://esm.sh/${packageJson.name}@${packageJson.version}`,
        );
        const { searchParams } = url;
        // searchParams.set("conditions", ["browser"]);

        if (dependencies.length > 0) {
          searchParams.set(
            "deps",
            dependencies
              .map(({ name, version }) => `${name}@${version}`)
              .join(","),
          );
        }

        return [name, url.href];
      },
    ),
  );
}
