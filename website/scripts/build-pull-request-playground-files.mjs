import { buildPackageManifest } from "./utilities.mjs";

async function build() {
  const { prettierEntry, pluginFiles } =
    await import("../static/lib/pull-request-package-data.mjs");

  const plugins = await Promise.all(
    pluginFiles.map(async (file) => ({
      url: `./lib/${file}`,
      plugin: await import(`../static/lib/${file}`),
    })),
  );

  await buildPackageManifest({ url: `./lib/${prettierEntry}` }, plugins);
}

await build();
