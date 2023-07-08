import { pathToFileURL } from "node:url";
// TODO: Use `import.meta.resolve` when it's available
import { resolve } from "import-meta-resolve";

/**
 * Import a module from a file.
 *
 * @param {string} specifier - The module specifier to import.
 * @param {string} parent - The path of the parent module that is importing the module.
 * @returns {Promise<any>} - A promise that resolves to the imported module.
 */
function importFromFile(specifier, parent) {
  const url = resolve(specifier, pathToFileURL(parent).href);
  return import(url);
}

export default importFromFile;
