import { createRequire } from "node:module";

/**
 * Requires a module from a file path relative to the parent module.
 *
 * @param {string} id - The module ID or path to require.
 * @param {string | URL} parent - The parent module to use as the base for the relative path.
 * @returns {*} - The exported module.
 */
function requireFromFile(id, parent) {
  const require = createRequire(parent);
  return require(id);
}

export default requireFromFile;
