import fs from "node:fs/promises";
import module from "node:module";
import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { visualizer as rollupPluginVisualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_CI = Boolean(process.env.CI);
const OUT_DIRECTORY = "./static/playground/";
const DEPENDENCIES_EXCLUDE_FROM_CDN = new Set(["@docusaurus/preset-classic"]);

// Local develop requires `vue` for HMR
if (!IS_PRODUCTION) {
  DEPENDENCIES_EXCLUDE_FROM_CDN.add("vue");
}

export default defineConfig(async () => ({
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
    alias: await buildCdnAlias(),
  },
  build: {
    outDir: OUT_DIRECTORY,
    minify: IS_CI,
  },
}));

async function buildCdnAlias() {
  // if (!IS_PRODUCTION) {
  //   return;
  // }

  return Object.fromEntries(
    await Promise.all(
      Object.keys(packageJson.dependencies)
        .filter((name) => !DEPENDENCIES_EXCLUDE_FROM_CDN.has(name))
        .map(async (name) => [name, await getPackageCdnUrl(name)]),
    ),
  );
}

async function getPackageCdnUrl(name) {
  const version = packageJson.dependencies[name];
  const url = new URL(`https://esm.sh/${name}@${version}`);

  let dependencies = await getPackageDependencies(name, import.meta.url);

  dependencies = dependencies
    // Exclude self
    .filter((dependency) => dependency.name !== name)
    // Sort alphabetically
    .toSorted(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
    // Dedupe
    .filter(
      ({ name, version }, index, dependencies) =>
        dependencies.findIndex(
          (searching) =>
            searching.name === name && searching.version === version,
        ) === index,
    );

  if (dependencies.length > 0) {
    url.searchParams.set(
      "deps",
      dependencies.map(({ name, version }) => `${name}@${version}`).join(","),
    );
  }

  return url;
}

async function getPackageJson(name, base) {
  const packageJsonUrl = module.findPackageJSON(name, base);

  return {
    url: packageJsonUrl,
    packageJson: JSON.parse(await fs.readFile(packageJsonUrl, "utf8")),
  };
}

async function getPackageDependenciesWithoutCache(name, base) {
  const { url, packageJson } = await getPackageJson(name, base);
  const dependencies = [{ name, version: packageJson.version }];
  for (const dependencyType of ["dependencies", "peerDependencies"]) {
    for (const name of Object.keys(packageJson[dependencyType] ?? {})) {
      dependencies.push(...(await getPackageDependencies(name, url)));
    }
  }
  return dependencies;
}

const cache = new Map();
function getPackageDependencies(name, base) {
  // We don't need deps from `vue`
  if (name === "vue") {
    return [];
  }

  const cacheKey = JSON.stringify({ name, base });

  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, getPackageDependenciesWithoutCache(name, base));
  }

  return cache.get(cacheKey);
}
