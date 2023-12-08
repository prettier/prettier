import { pathToFileURL } from "node:url";
// TODO: Use `import.meta.resolve` when it's available
import { resolve } from "import-meta-resolve";

function importFromFile(specifier, parent) {
  const url = resolve(specifier, pathToFileURL(parent).href);
  return import(url);
}

export default importFromFile;
