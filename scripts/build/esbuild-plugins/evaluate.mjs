import createEsmUtils from "esm-utils";

const { importModule } = createEsmUtils(import.meta);

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",

    setup(build) {
      build.onLoad({ filter: /\.evaluate\.js$/ }, async ({ path }) => {
        let data = await importModule(path);

        if (data.default) {
          if (Object.keys(data).length !== 1) {
            throw new TypeError("Mixed export not allowed.");
          }

          data = data.default;
        }

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
