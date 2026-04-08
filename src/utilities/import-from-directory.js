import path from "node:path";
import importFromFile from "./import-from-file.js";

function importFromDirectory(specifier, directory) {
  return importFromFile(specifier, path.join(directory, "noop.js"));
}

export default importFromDirectory;
