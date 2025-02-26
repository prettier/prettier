import fs from "node:fs/promises";
import path from "node:path";
import packageJson from "./package.json" with { type: "json" };

const rules = {};

for (const dirent of await fs.readdir(import.meta.dirname, {
  withFileTypes: true,
})) {
  const fileName = dirent.name;

  if (
    dirent.isDirectory() ||
    !fileName.endsWith(".js") ||
    fileName === "index.js" ||
    fileName === "test.js"
  ) {
    continue;
  }

  const name = path.basename(fileName, ".js");
  const { default: rule } = await import(
    new URL(fileName, import.meta.url).href
  );

  if (rule.meta?.docs?.url) {
    throw new Error(`Please remove 'meta.docs.url' from '${fileName}'.`);
  }

  rule.meta ??= {};
  rule.meta.docs ??= {};
  rule.meta.docs.url = `https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/${fileName}`;

  rules[name] = rule;
}

export default {
  meta: { name: packageJson.name, version: packageJson.version },
  rules,
};
