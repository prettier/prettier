import { clearCache as clearPluginLoadCache } from "./load-plugin.js";
import { clearCache as clearPluginSearchCache } from "./search-plugins.js";

export function clearCache() {
  clearPluginLoadCache();
  clearPluginSearchCache();
}
export { default as loadBuiltinPlugins } from "./load-builtin-plugins.js";
export { default as loadPlugins } from "./load-plugins.js";
export { searchPlugins } from "./search-plugins.js";
