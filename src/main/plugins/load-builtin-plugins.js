const loadBuiltinPluginsWithoutCache = async function () {
  const { plugins } = await (process.env.NODE_ENV === "production"
    ? import("./builtin-plugins/production-plugins.js")
    : import("./builtin-plugins/development-plugins.js"));
  return plugins;
};

let cache;
function loadBuiltinPlugins() {
  return (cache ??= loadBuiltinPluginsWithoutCache());
}

export default loadBuiltinPlugins;
