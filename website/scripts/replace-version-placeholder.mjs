import fs from "node:fs/promises";

const DIRECTORY = new URL("../versioned_docs/version-stable/", import.meta.url);
let version = process.env.PRETTIER_VERSION;

if (!version) {
  const packageJsonFile = new URL("../../package.json", import.meta.url);
  const packageJson = JSON.parse(await fs.readFile(packageJsonFile));
  ({ version } = packageJson);
}

await Promise.all(
  ["browser.md"].map(async (file) => {
    file = new URL(file, DIRECTORY);

    let content = await fs.readFile(file, "utf8");

    content = content.replaceAll("%PRETTIER_VERSION%", version);

    await fs.writeFile(file, content);
  }),
);
