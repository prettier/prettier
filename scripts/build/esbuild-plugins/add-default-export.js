import path from "node:path";

const PLUGIN_NAMESPACE = "with-default-export";
export default function esbuildPluginAddDefaultExport() {
  return {
    name: "addDefaultExport",
    setup(build) {
      const { initialOptions } = build;
      if (initialOptions.format !== "esm") {
        return;
      }

      build.onResolve({ filter: /./, namespace: "file" }, (module) => {
        if (module.kind === "entry-point") {
          const file = module.path;
          const relativePath = path
            .relative(module.resolveDir, file)
            .replaceAll("\\", "/");
          return {
            path: relativePath,
            namespace: PLUGIN_NAMESPACE,
            pluginData: { file },
          };
        }
      });

      build.onLoad({ filter: /./, namespace: PLUGIN_NAMESPACE }, (module) => {
        const { file } = module.pluginData;
        const source = JSON.stringify(`./${path.basename(file)}`);

        return {
          contents: /* indent */ `
            import * as namespace from ${source};

            export * from ${source};
            export default namespace;
          `,
          resolveDir: path.dirname(file),
        };
      });
    },
  };
}
