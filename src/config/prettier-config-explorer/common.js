import fs from "node:fs/promises";

const CONFIG_FILE_NAMES = [
  "package.json",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json5",
  ".prettierrc.js",
  ".prettierrc.mjs",
  ".prettierrc.cjs",
  "prettier.config.js",
  "prettier.config.mjs",
  "prettier.config.cjs",
  ".prettierrc.toml",
];

async function fileExists(file) {
  let stats;
  try {
    stats = await fs.stat(file);
  } catch {
    return false;
  }

  return stats.isFile();
}

export { CONFIG_FILE_NAMES, fileExists };
