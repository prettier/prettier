import createEsmUtils from "esm-utils";
import serialize from "serialize-javascript";

const { importModule } = createEsmUtils(import.meta);

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",
    setup(build) {
      const { format } = build.initialOptions;

      build.onLoad({ filter: /\.evaluate\.c?js$/ }, async ({ path }) => {
        const module = await importModule(path);
        const text = Object.entries(module)
          .map(([key, value]) => {
            value = serialize(value, { space: 2 });

            if (key === "default") {
              return format === "cjs"
                ? `module.exports = ${value};`
                : `export default ${value};`;
            }

            return format === "cjs"
              ? `exports[${key}] = ${value};`
              : `export const ${key} = ${value};`;
          })
          .join("\n");

        return { contents: text };
      });
    },
  };
}
