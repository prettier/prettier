import { pathToFileURL } from "node:url";
import { resolve } from "import-meta-resolve";

async function importFromFile(specifier, parent) {
  const url = await resolve(specifier, pathToFileURL(parent));

  return import(url);
}

export { importFromFile };
