import createEsmUtils from "esm-utils";
import serialize from "serialize-javascript";
import { isValidIdentifier } from "@babel/types";

const { importModule } = createEsmUtils(import.meta);

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",
    setup(build) {
      const { format } = build.initialOptions;

      build.onLoad({ filter: /\.evaluate\.c?js$/ }, async ({ path }) => {
        const module = await importModule(path);
        const text = Object.entries(module)
          .map(([specifier, value]) => {
            value = serialize(value, { space: 2 });

            if (specifier === "default") {
              return format === "cjs"
                ? `module.exports = ${value};`
                : `export default ${value};`;
            }

            if (!isValidIdentifier(specifier)) {
              throw new Error(`${specifier} is not a valid specifier`);
            }

            return format === "cjs"
              ? `exports.${specifier} = ${value};`
              : `export const ${specifier} = ${value};`;
          })
          .join("\n");
        return { contents: text };
      });
    },
  };
}
