import url from "node:url";
import { isValidIdentifier } from "@babel/types";
import serialize from "serialize-javascript";

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",
    setup(build) {
      build.onLoad(
        { filter: /\.evaluate\.[cm]?js$/, namespace: "file" },
        async ({ path }) => {
          const module = await import(url.pathToFileURL(path));
          const text = Object.entries(module)
            .map(([specifier, value]) => {
              const code =
                value instanceof RegExp
                  ? `/${value.source}/${value.flags}`
                  : serialize(value, { space: 2 });

              if (specifier === "default") {
                return `export default ${code};`;
              }

              if (!isValidIdentifier(specifier)) {
                throw new Error(`${specifier} is not a valid specifier`);
              }

              return `export const ${specifier} = ${code};`;
            })
            .join("\n");
          return { contents: text };
        },
      );
    },
  };
}
