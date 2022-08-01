import { pathToFileURL } from "node:url";
// TODO: Use `import.meta.resolve` when it's available
import { resolve } from "import-meta-resolve";

async function importFromFile(specifier, parent) {
  const url = await resolve(specifier, pathToFileURL(parent).href);
  return import(url);
}

export default importFromFile;
