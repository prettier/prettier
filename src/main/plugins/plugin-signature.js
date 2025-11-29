/**
 * Utilities for creating plugin signatures for cache invalidation
 */
import stringify from "fast-json-stable-stringify";

/**
 * Extract plugin metadata for cache signature
 * @param {object} plugin - Loaded plugin object
 * @returns {object|null} Plugin metadata or null if not available
 */
function extractPluginMetadata(plugin) {
  // Only use explicit plugin metadata
  if (plugin.meta && typeof plugin.meta === "object") {
    const { name, version } = plugin.meta;
    if (typeof name === "string" && typeof version === "string") {
      return { name, version };
    }
  }
  
  return null;
}

/**
 * Create a deterministic signature from plugin metadata
 * @param {Array<object>} plugins - Array of loaded plugins
 * @returns {string} Plugin signature for cache key
 */
function createPluginSignature(plugins) {
  if (!Array.isArray(plugins) || plugins.length === 0) {
    return "";
  }
  
  const pluginMetadata = [];
  
  for (const plugin of plugins) {
    const metadata = extractPluginMetadata(plugin);
    if (metadata) {
      pluginMetadata.push(metadata);
    }
  }
  
  if (pluginMetadata.length === 0) {
    return "";
  }
  
  // Preserve original order - do not sort
  // Create compact signature: "name@version,name@version"
  return pluginMetadata
    .map(({ name, version }) => `${name}@${version}`)
    .join(",");
}

export { createPluginSignature, extractPluginMetadata };