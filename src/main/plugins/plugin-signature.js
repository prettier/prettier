/**
 * Utilities for creating plugin signatures for cache invalidation
 */
import fs from "node:fs";
import path from "node:path";
import stringify from "fast-json-stable-stringify";

// Cache for package.json reads to avoid repeated I/O
const packageJsonCache = new Map();

/**
 * Read package.json from a plugin's directory
 * @param {string} pluginPath - Path to the plugin file
 * @param {object=} fsModule - Optional fs module for testing (defaults to node:fs)
 * @returns {object|null} Package.json content or null if not found
 */
function readPluginPackageJson(pluginPath, fsModule = fs) {
  if (!pluginPath || typeof pluginPath !== "string") {
    return null;
  }

  // Use cached result if available
  if (packageJsonCache.has(pluginPath)) {
    return packageJsonCache.get(pluginPath);
  }

  try {
    // Find package.json by walking up from plugin file
    let currentDir = path.dirname(path.resolve(pluginPath));
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const packageJsonPath = path.join(currentDir, "package.json");
      
      try {
        const packageJsonContent = fsModule.readFileSync(packageJsonPath, "utf8");
        const packageJson = JSON.parse(packageJsonContent);
        
        // Cache the result
        packageJsonCache.set(pluginPath, packageJson);
        return packageJson;
      } catch {
        // Continue searching in parent directory
        currentDir = path.dirname(currentDir);
      }
    }
  } catch {
    // Ignore errors and continue
  }

  // Cache null result to avoid repeated failed attempts
  packageJsonCache.set(pluginPath, null);
  return null;
}

/**
 * Extract plugin metadata for cache signature
 * @param {object} plugin - Loaded plugin object
 * @param {string=} pluginPath - Optional path to the plugin file for package.json fallback
 * @param {object=} fsModule - Optional fs module for testing (defaults to node:fs)
 * @returns {object|null} Plugin metadata or null if not available
 */
function extractPluginMetadata(plugin, pluginPath, fsModule = fs) {
  // 1. Prefer explicit plugin metadata
  if (plugin.prettierPluginMeta && typeof plugin.prettierPluginMeta === "object") {
    const { name, version } = plugin.prettierPluginMeta;
    if (typeof name === "string" && typeof version === "string") {
      return { name, version };
    }
  }
  
  // 2. Fallback to package.json when metadata is absent
  if (pluginPath) {
    const packageJson = readPluginPackageJson(pluginPath, fsModule);
    if (packageJson && packageJson.name && packageJson.version) {
      return { 
        name: packageJson.name, 
        version: packageJson.version 
      };
    }
  }
  
  // 3. Legacy fallback to plugin.name (for backward compatibility)
  if (typeof plugin.name === "string") {
    return { name: plugin.name, version: "unknown" };
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
    // Pass the plugin.name (original path/name) for package.json fallback
    const metadata = extractPluginMetadata(plugin, plugin.name);
    if (metadata) {
      pluginMetadata.push(metadata);
    }
  }
  
  if (pluginMetadata.length === 0) {
    return "";
  }
  
  // Sort by name for deterministic ordering
  pluginMetadata.sort((a, b) => a.name.localeCompare(b.name));
  
  // Create compact signature: "name@version,name@version"
  return pluginMetadata
    .map(({ name, version }) => `${name}@${version}`)
    .join(",");
}

export { createPluginSignature, extractPluginMetadata, packageJsonCache };