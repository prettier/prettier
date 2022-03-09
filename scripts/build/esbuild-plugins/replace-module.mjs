import { dirname } from "node:path";

export default function esbuildPluginReplaceModule(replacements = {}) {
  replacements = new Map(
    Object.entries(replacements).map(([file, options]) => [
      file,
      typeof options === "string" ? { path: options } : options,
    ])
  );

  return {
    name: "replace-module",
    setup(build) {
      build.onResolve({ filter: /./ }, async (args) => {
        if (args.kind !== "import-statement" && args.kind !== "require-call") {
          return;
        }

        const resolveResult = await build.resolve(args.path, {
          resolveDir: args.resolveDir,
        });

        if (replacements.has(resolveResult.path)) {
          const { external, path } = replacements.get(resolveResult.path);

          if (external) {
            return { path, external: true };
          }
        }

        return resolveResult;
      });

      build.onLoad({ filter: /./ }, (args) => {
        if (!replacements.has(args.path)) {
          return;
        }

        let {
          path,
          resolveDir,
          contents,
          loader = "js",
        } = replacements.get(args.path);

        if (
          !resolveDir &&
          (args.namespace === "node-modules-polyfills-commonjs" ||
            args.namespace === "node-modules-polyfills") &&
          path
        ) {
          resolveDir = dirname(path);
        }

        if (path) {
          contents = `module.exports = require(${JSON.stringify(`${path}`)})`;
        }

        return { contents, loader, resolveDir };
      });
    },
  };
}
