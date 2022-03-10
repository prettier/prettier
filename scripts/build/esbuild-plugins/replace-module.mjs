export default function esbuildPluginReplaceModule(replacements = {}) {
  const pathReplacements = new Map();
  const contentsReplacements = new Map();

  for (let [file, options] of Object.entries(replacements)) {
    if (typeof options === "string") {
      options = { path: options };
    }

    if (Reflect.has(options, "path")) {
      pathReplacements.set(file, options);
      continue;
    }

    if (Reflect.has(options, "contents")) {
      contentsReplacements.set(file, options);
      continue;
    }

    throw new Error("'path' or 'contents' is required.");
  }

  return {
    name: "replace-module",
    setup(build) {
      // `build.resolve()` will call `onResolve` listener
      // Avoid infinite loop
      const seen = new Set();

      build.onResolve({ filter: /./ }, async (args) => {
        if (
          !(args.kind === "require-call" || args.kind === "import-statement") ||
          args.namespace !== "file"
        ) {
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
        // Return `undefined` instead of `resolveResult` so esbuild can resolve correctly
        return pathReplacements.get(resolveResult.path);
      });

      build.onLoad({ filter: /./ }, ({ path }) =>
        contentsReplacements.get(path)
      );
    },
  };
}
