import fs from "node:fs/promises";
import module from "node:module";
import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { visualizer as rollupPluginVisualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_CI = Boolean(process.env.CI);
const DEPENDENCIES_EXCLUDE_FROM_CDN = new Set([
  "cm6-graphql",
  "@docusaurus/preset-classic",
]);

export default defineConfig(async () => ({
  base: IS_PRODUCTION ? "/playground/" : undefined,
  publicDir: IS_PRODUCTION ? undefined : "./static/",
  plugins: [
    vitePluginVue(),
    vitePluginVueJsx(),
    IS_CI || !IS_PRODUCTION
      ? undefined
      : rollupPluginVisualizer({
          filename: "./static/playground/report.html",
        }),
  ].filter(Boolean),
  resolve: {
    alias: await buildCdnAlias(),
  },
  build: {
    outDir: "./static/playground/",
    minify: IS_CI,
  },
}));

async function buildCdnAlias() {
  // if (!IS_PRODUCTION) {
  //   return;
  // }

  const alias = {};

  for (const [name, version] of Object.entries(packageJson.dependencies)) {
    if (DEPENDENCIES_EXCLUDE_FROM_CDN.has(name)) {
      continue;
    }

    const url = new URL(`https://esm.sh/${name}@${version}`);
    let deps = await getPackageDependencies(name, import.meta.url);

    // Exclude self
    deps = deps.filter((dependency) => dependency.name !== name);

    if (deps.length > 0) {
      url.searchParams.set(
        "deps",
        deps.map(({ name, version }) => `${name}@${version}`).join(","),
      );
    }

    alias[name] = url;
  }

  return alias;
}

async function getPackageJson(name, base) {
  const packageJsonUrl = module.findPackageJSON(name, base);

  return {
    url: packageJsonUrl,
    packageJson: JSON.parse(await fs.readFile(packageJsonUrl, "utf8")),
  };
}

const cache = new Map();
async function getPackageDependenciesWithoutCache(name, base) {
  const { url, packageJson } = await getPackageJson(name, base);

  const dependencies = [{ name, version: packageJson.version }];
  for (const name of Object.keys(packageJson.dependencies ?? {})) {
    dependencies.push(...(await getPackageDependencies(name, url)));
  }
  return dependencies;
}

function getPackageDependencies(name, base) {
  const cacheKey = JSON.stringify({ name, base });

  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, getPackageDependenciesWithoutCache(name, base));
  }

  return cache.get(cacheKey);
}
