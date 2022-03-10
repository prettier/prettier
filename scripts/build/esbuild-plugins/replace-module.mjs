export default function esbuildPluginReplaceModule(replacements = {}) {
  replacements = Object.entries(replacements).map(([file, options]) => {
    if (typeof options === "string") {
      options = { path: options };
    }

    if (
      !Object.prototype.hasOwnProperty.call(options, "path") &&
      !Object.prototype.hasOwnProperty.call(options, "contents")
    ) {
      throw new Error("'path' or 'contents' is required.");
    }

    return [file, options];
  });

  // `build.resolve()` will call `onResolve` listener
  // Avoid
  const seen = new Set();
  const pathReplacements = new Map(
    replacements.filter(([, replacement]) => replacement.path)
  );
  const contentsReplacements = new Map(
    replacements.filter(([, replacement]) => !replacement.path)
  );

  return {
    name: "replace-module",
    setup(build) {
      build.onResolve({ filter: /./ }, async (args) => {
        if (args.kind !== "require-call") {
          return;
        }

        if (args.namespace !== "file") {
          return;
        }

        const key = JSON.stringify(args);
        if (seen.has(key)) {
          return;
        }
        seen.add(key);

        const resolveResult = await build.resolve(args.path, {
          importer: args.importer,
          namespace: args.namespace,
          resolveDir: args.resolveDir,
          kind: args.kind,
          pluginData: args.pluginData,
        });

        // `build.resolve()` seems not respecting `browser` field in `package.json`
        // Return `undefined` instead of `resolveResult` so esbuild will resolve correctly
        return pathReplacements.get(resolveResult.path);
      });

      build.onLoad({ filter: /./ }, ({ path }) =>
        contentsReplacements.get(path)
      );
    },
  };
}
