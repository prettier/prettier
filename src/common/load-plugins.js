import {
  loadPlugin,
  clearCache as clearPluginLoadCache,
} from "./load-plugin.js";

function loadPlugins(plugins = []) {
  return Promise.all(plugins.map((plugin) => loadPlugin(plugin)));
}

loadPlugins.clearCache = () => {
  clearPluginLoadCache();
};

export default loadPlugins;
