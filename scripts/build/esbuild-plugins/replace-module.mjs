export default function esbuildPluginReplaceModule(replacements = {}) {
  return {
    name: "replace-module",
    setup(build) {
      build.onLoad({ filter: /./ }, ({ path }) => {
        if (!Reflect.has(replacements, path)) {
          return;
        }

        let replacement = replacements[path];

        if (typeof replacement === "string") {
          replacement = { path: replacement };
        }

        if (replacement.external) {
          // Prevent `esbuild` to resolve
          return {
            contents: `
              module.exports = require.call(undefined, ${JSON.stringify(
                `${replacement.path}`
              )});
            `,
          };
        }

        if (replacement.path) {
          replacement = {
            contents: `
              module.exports = require(${JSON.stringify(
                `${replacement.path}`
              )});
            `,
          };
        }

        return replacement;
      });
    },
  };
}
