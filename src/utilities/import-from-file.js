import { pathToFileURL } from "node:url";
// TODO: Use `import.meta.resolve` when it's available
import { resolve } from "import-meta-resolve";

function resolveFromFile(specifier, parent) {
  return resolve(specifier, pathToFileURL(parent).href);
}

function importFromFile(specifier, parent) {
  return import(resolveFromFile(specifier, parent));
}

export { resolveFromFile };
export default importFromFile;
