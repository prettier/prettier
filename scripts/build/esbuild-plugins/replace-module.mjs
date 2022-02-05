import { dirname } from "node:path";

export default function esbuildPluginReplaceModule(replacements = {}) {
  return {
    name: "replace-module",
    setup(build) {
      build.onLoad({ filter: /./ }, ({ path, namespace }) => {
        let options = replacements[path];

        if (!options) {
          return;
        }

        options =
          typeof options === "string" ? { path: options } : { ...options };

        let {
          path: file,
          resolveDir,
          contents,
          loader = "js",
          external: isExternal,
        } = options;

        // Make this work with `@esbuild-plugins/node-modules-polyfill` plugin
        if (
          !resolveDir &&
          namespace === "node-modules-polyfills-commonjs" &&
          file
        ) {
          resolveDir = dirname(file);
        }

        if (isExternal) {
          if (!file) {
            throw new Error("Missing external module path.");
          }

          // Prevent `esbuild` to resolve
          contents = `
            const entry = ${JSON.stringify(`${file}`)};
            module.exports = require(entry);
          `;
        } else {
          if (file) {
            contents = `
              module.exports = require(${JSON.stringify(`${file}`)});
            `;
          }
        }

        return { contents, loader, resolveDir };
      });
    },
  };
}
