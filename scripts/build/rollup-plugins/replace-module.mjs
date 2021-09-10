import fs from "node:fs";

export default function rollupPluginReplaceModule(replacements = {}) {
  return {
    name: "replace-module",

    load(importee) {
      if (!Reflect.has(replacements, importee)) {
        return;
      }

      const replacement = replacements[importee];

      if (typeof replacement === "string") {
        return `export default require(${JSON.stringify(replacement)});`;
      }

      if (replacement.file) {
        return fs.readFileSync(replacement.file, "utf8");
      }

      return replacement.code;
    },
  };
}
