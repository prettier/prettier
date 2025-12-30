import assert from "node:assert/strict";
import vitePluginVue from "@vitejs/plugin-vue";
import vitePluginVueJsx from "@vitejs/plugin-vue-jsx";
import { visualizer as rollupPluginVisualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };
import { getPackageDependencies } from "./scripts/collect-dependencies.mjs";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_CI = Boolean(process.env.CI);
const OUT_DIRECTORY = "./static/playground/";
const cdnDependencies = {
  exclude: new Set(["@docusaurus/preset-classic"]),
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

export default defineConfig(async () => {
  const alias = await buildCdnAlias();

  return {
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
  };
});

async function buildCdnAlias() {
  // if (!IS_PRODUCTION) {
  //   return;
  // }

  return Object.fromEntries(
    await Promise.all(
      Object.keys(packageJson.dependencies)
        .filter((name) => !cdnDependencies.exclude.has(name))
        .map(async (name) => [name, await getPackageCdnUrl(name)]),
    ),
  );
}

async function getPackageCdnUrl(name) {
  const { version, dependencies } = await getPackageDependencies({
    name,
    base: import.meta.url,
    overrideDependencies: cdnDependencies.overrideDependencies,
    ignoreDependencies: cdnDependencies.ignoreDependencies,
  });
  const url = new URL(`https://esm.sh/${name}@${version}`);

  assertDependenciesUnique(name, dependencies);

  if (dependencies.length > 0) {
    url.searchParams.set(
      "deps",
      dependencies.map(({ name, version }) => `${name}@${version}`).join(","),
    );
  }

  return url.href;
}

function assertDependenciesUnique(name, dependencies) {
  const versions = new Map();

  for (const dependency of dependencies) {
    assert.ok(
      !versions.has(dependency.name),
      `Multiple version of '${dependency.name}' in dependency tree of '${name}', '${versions.get(dependency.name)?.version}' and '${dependency.version}'.`,
    );
    versions.set(dependency.name, dependency);
  }
}
