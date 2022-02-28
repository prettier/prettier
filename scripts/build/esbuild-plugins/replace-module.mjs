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
        if (args.kind !== "import-statement") {
          return;
        }

        const resolveResult = await build.resolve(args.path, {
          resolveDir: args.resolveDir,
        });

        if (replacements.has(resolveResult.file)) {
          const { external, path } = replacements.get(resolveResult.file);

          if (external) {
            return { ...resolveResult, path, external: true };
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
          isEsm,
        } = replacements.get(args.path);

        if (loader !== "js") {
          return { contents, loader };
        }

        // Make this work with `@esbuild-plugins/node-modules-polyfill` plugin
        if (
          !resolveDir &&
          (args.namespace === "node-modules-polyfills-commonjs" ||
            args.namespace === "node-modules-polyfills") &&
          path
        ) {
          resolveDir = dirname(path);
        }

        if (path) {
          contents = isEsm
            ? `export { default } from ${JSON.stringify(`${path}`)};`
            : `module.exports = require(${JSON.stringify(`${path}`)})`;
        }

        return { contents, loader, resolveDir };
      });
    },
  };
}
