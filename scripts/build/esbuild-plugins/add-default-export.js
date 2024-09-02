import path from "node:path";

const namespace = "with-default-export";
export default function esbuildPluginAddDefaultExport() {
  return {
    name: "addDefaultExport",
    setup(build) {
      const { initialOptions } = build;
      if (initialOptions.format !== "esm") {
        return;
      }

      let entry;

      build.onResolve({ filter: /./u }, (module) => {
        if (module.kind === "entry-point") {
          const relativePath = module.path
            .slice(module.resolveDir.length + 1)
            .replaceAll("\\", "/");

          entry = module.path;
          return { path: relativePath, namespace };
        }
      });

      build.onLoad({ filter: /./u, namespace }, () => {
        const directory = path.dirname(entry);
        const source = `./${path.basename(entry)}`;

        return {
          contents: /* indent */ `
            import * as namespace from "${source}";

            export * from "${source}";
            export default namespace;
          `,
          resolveDir: directory,
        };
      });
    },
  };
}
