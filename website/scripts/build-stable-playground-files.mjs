import assert from "node:assert/strict";
import { buildPackageManifest } from "./utilities.mjs";

function getCdnUrl(packageJson, file) {
  return new URL(
    file,
    `https://unpkg.com/${packageJson.name}@${packageJson.version}/`,
  ).href;
}

function getPackageEntry(packageJson, entry = ".") {
  assert.ok(entry.startsWith("."));
  const { exports } = packageJson;
  assert.ok(Object.hasOwn(exports, entry));
  let file = exports[entry];
  while (file && typeof file !== "string") {
    file = file.browser ?? file.import ?? file.default;
  }

  assert.equal(typeof file, "string");

  const url = getCdnUrl(packageJson, file);

  const packageName = packageJson.name;

  return {
    package: packageJson.name,
    version: packageJson.version,
    entry,
    importSource: packageName + entry.slice(1),
    file,
    url,
  };
}

async function getPackageJson(packageName) {
  const { default: packageJson } = await import(`${packageName}/package.json`, {
    with: {
      type: "json",
    },
  });

  assert.equal(packageJson.name, packageName);

  return packageJson;
}

async function build() {
  const prettierPackageJson = await getPackageJson("prettier");
  const prettierEntry = getPackageEntry(prettierPackageJson);
  const builtinPlugins = Object.keys(prettierPackageJson.exports)
    .filter((entry) => entry.startsWith("./plugins/"))
    .filter((entry) => entry !== "./plugins/flow")
    .map((entry) => getPackageEntry(prettierPackageJson, entry));

  const externalPlugins = await Promise.all(
    ["@prettier/plugin-oxc", "@prettier/plugin-hermes"].map(
      async (packageName) => {
        const packageJson = await getPackageJson(packageName);
        return getPackageEntry(packageJson);
      },
    ),
  );

  const plugins = await Promise.all(
    [...builtinPlugins, ...externalPlugins].map(async (plugin) => ({
      url: plugin.url,
      plugin: await import(plugin.importSource),
    })),
  );

  await buildPackageManifest(prettierEntry, plugins);
}

await build();
