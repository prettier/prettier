import createEsmUtils from "esm-utils";

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
      build.onResolve({ filter: /./ }, (args) => {
        if (args.kind !== "require-call") {
          return;
        }

        if (args.namespace !== "file") {
          return;
        }

        // Can't work with `kind`
        // const resolveResult = await build.resolve(args.path, {
        //   importer: args.importer,
        //   namespace: args.namespace,
        //   resolveDir: args.resolveDir,
        //   kind: args.kind,
        //   pluginData: args.pluginData,
        // });
        const path = createEsmUtils(args.importer).require.resolve(args.path);

        return pathReplacements.get(path);
      });

      build.onLoad({ filter: /./ }, ({ path }) =>
        contentReplacements.get(path)
      );
    },
  };
}
