import fs from "node:fs";

export default function esbuildPluginReplaceModule(replacements = {}) {
  return {
    name: "replace-module",
    setup(build) {
      build.onLoad({ filter: /./ }, ({ path }) => {
        if (!Reflect.has(replacements, path)) {
          return;
        }

        const replacement = replacements[path];

        if (typeof replacement === "string") {
          return {
            contents: `module.exports = require(${JSON.stringify(replacement)});`,
          };
        }

        if (replacement.file) {
          return {
            contents: fs.readFileSync(replacement.file, "utf8"),
          };
        }

        return {
          contents: replacement.code,
        };
      });
    },
  };
}
