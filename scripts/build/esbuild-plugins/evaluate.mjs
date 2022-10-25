import createEsmUtils from "esm-utils";

const { importModule } = createEsmUtils(import.meta);

function serialize(value) {
  return JSON.stringify(
    value,
    (_, v) => {
      if (typeof v === "function") {
        throw new TypeError("Cannot evaluate functions.");
      }
      return v;
    },
    2
  );
}

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",

    setup(build) {
      build.onLoad({ filter: /\.evaluate\.c?js$/ }, async ({ path }) => {
        const module = await importModule(path);
        const text = Object.entries(module)
          .map(([key, value]) =>
            key === "default"
              ? `export default ${serialize(value)};`
              : `export const ${key} = ${serialize(value)};`
          )
          .join("\n");
        return { contents: text };
      });
    },
  };
}
