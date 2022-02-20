import createEsmUtils from "esm-utils";

const { importModule } = createEsmUtils(import.meta);

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",

    setup(build) {
      build.onLoad({ filter: /\.evaluate\.js$/ }, async ({ path }) => {
        const data = await importModule(path);

        const json = JSON.stringify(data, (_, v) => {
          if (typeof v === "function") {
            throw new TypeError("Cannot evaluate functions.");
          }
          return v;
        });

        return { loader: "json", contents: json };
      });
    },
  };
}
