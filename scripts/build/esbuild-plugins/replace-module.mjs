export default function esbuildPluginReplaceModule(replacements = {}) {
  replacements = Object.entries(replacements).map(([file, options]) => [
    file,
    typeof options === "string" ? { path: options } : options,
  ]);

  const pathReplacements = new Map(
    replacements.filter(([, replacement]) => replacement.path)
  );
  const contentReplacements = new Map(
    replacements.filter(([, replacement]) => !replacement.path)
  );

  return {
    name: "replace-module",
    setup(build) {
      build.onResolve({ filter: /./ }, async (args) => {
        if (args.kind !== "import-statement" && args.kind !== "require-call") {
          return;
        }

        const resolveResult = await build.resolve(args.path, {
          importer: args.importer,
          namespace: args.namespace,
          resolveDir: args.resolveDir,
          kind: args.kind,
          pluginData: args.pluginData,
        });

        return pathReplacements.get(resolveResult.path) || resolveResult;
      });

      build.onLoad({ filter: /./ }, ({ path }) =>
        contentReplacements.get(path)
      );
    },
  };
}
