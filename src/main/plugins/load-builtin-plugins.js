const loadBuiltinPluginsWithoutCache =
  process.env.NODE_ENV === "production"
    ? async () =>
        (await import("./builtin-plugins/production-plugins.js")).plugins
    : async () =>
        (await import("./builtin-plugins/development-plugins.js")).plugins;

let cache;
function loadBuiltinPlugins() {
  return (cache ??= loadBuiltinPluginsWithoutCache());
}

export default loadBuiltinPlugins;
