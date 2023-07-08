import path from "node:path";
import importFromFile from "./import-from-file.js";

/**
 * Import a module from a directory.
 *
 * @param {string} specifier - The module specifier to import.
 * @param {string} directory - The directory to import from.
 * @returns {Promise<any>} - A promise that resolves to the imported module.
 */
function importFromDirectory(specifier, directory) {
  return importFromFile(specifier, path.join(directory, "noop.js"));
}

export default importFromDirectory;
