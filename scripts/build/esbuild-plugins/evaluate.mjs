import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",

    setup(build) {
      build.onLoad({ filter: /\.evaluate\.js$/ }, ({ path }) => {
        const json = JSON.stringify(require(path), (_, v) => {
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
