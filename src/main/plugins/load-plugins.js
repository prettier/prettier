import { loadPlugin } from "./load-plugin.js";

function loadPlugins(plugins = []) {
  return Promise.all(plugins.map((plugin) => loadPlugin(plugin)));
}

export default loadPlugins;
