import fs from "node:fs/promises";
import serialize from "serialize-javascript";

const IS_CI = process.env.CI;

const packageManifestFile = new URL(
  "../static/lib/package-manifest.mjs",
  import.meta.url,
);

async function buildPackageManifest(prettierEntry, plugins) {
  const packageManifest = {
    prettier: { url: prettierEntry.url },
    plugins: plugins.map(({ url, plugin: pluginImplementation }) => {
      const plugin = { url };

      for (const property of ["languages", "options", "defaultOptions"]) {
        const value = pluginImplementation[property];
        if (value !== undefined) {
          plugin[property] = value;
        }
      }

      for (const property of ["parsers", "printers"]) {
        const value = pluginImplementation[property];
        if (value !== undefined) {
          plugin[property] = Object.keys(value);
        }
      }

      return plugin;
    }),
  };

  await fs.mkdir(new URL("./", packageManifestFile), { recursive: true });
  await fs.writeFile(
    packageManifestFile,
    `export default ${serialize(packageManifest, IS_CI ? undefined : { space: 2 })};`,
  );
}

export { buildPackageManifest };
