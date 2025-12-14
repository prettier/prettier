const loadBuiltinPluginsWithoutCache =
  process.env.NODE_ENV === "production"
    ? async function () {
        return Object.values(
          await import("./builtin-plugins/production-plugins.js"),
        );
      }
    : async function () {
        return Object.values(
          await import("./builtin-plugins/development-plugins.js"),
        );
      };

let cache;
function loadBuiltinPlugins() {
  return (cache ??= loadBuiltinPluginsWithoutCache());
}

export default loadBuiltinPlugins;
