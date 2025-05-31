import fs from "node:fs/promises";

const version = await getPrettierVersion();

// Copy sidebar config
const STABLE_SIDEBAR = relativeURL(
  "../versioned_sidebars/version-stable-sidebars.json",
);
const CURRENT_SIDEBAR = relativeURL("../sidebars.json");

await fs.copyFile(CURRENT_SIDEBAR, STABLE_SIDEBAR);

// Copy docs
const STABLE_DOCS_DIRECTORY = relativeURL("../versioned_docs/version-stable/");
const CURRENT_DOCS_DIRECTORY = relativeURL("../../docs/");

await fs.rm(STABLE_DOCS_DIRECTORY, { recursive: true, force: true });
await fs.mkdir(STABLE_DOCS_DIRECTORY, { recursive: true, force: true });
await fs.cp(CURRENT_DOCS_DIRECTORY, STABLE_DOCS_DIRECTORY, { recursive: true });

// Replace version placeholders
await Promise.all(
  ["browser.md"].map(async (file) => {
    file = new URL(file, STABLE_DOCS_DIRECTORY);
    await replaceVersionPlaceholder(file, version);
  }),
);

async function getPrettierVersion() {
  const version = process.env.PRETTIER_VERSION;

  if (!version) {
    const packageJsonFile = new URL("../../package.json", import.meta.url);
    const packageJson = JSON.parse(await fs.readFile(packageJsonFile));
    return packageJson.version;
  }
  return version;
}

/**
 * @param {import("fs").PathLike} path
 */
function relativeURL(path) {
  return new URL(path, import.meta.url);
}

/**
 * @param {import("fs").PathLike} path
 * @param {string} version
 */
async function replaceVersionPlaceholder(path, version) {
  let content = await fs.readFile(path, "utf8");
  content = content.replaceAll("%PRETTIER_VERSION%", version);
  await fs.writeFile(path, content);
}
