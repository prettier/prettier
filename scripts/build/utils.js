import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { resolve } from "import-meta-resolve";
import { PROJECT_ROOT } from "../utils/index.js";

const NODE_MODULES_PATH = path.join(PROJECT_ROOT, "node_modules");

function getPackageFile(file, base) {
  const packageName = file
    .split("/")
    .slice(0, file.startsWith("@") ? 2 : 1)
    .join("/");

  const packageEntry = url.fileURLToPath(
    resolve(
      packageName,
      base ?? url.pathToFileURL(path.join(NODE_MODULES_PATH, packageName)),
    ),
  );
  const dirname = `/node_modules/${packageName}/`.replaceAll("/", path.sep);
  const index = packageEntry
    .slice(PROJECT_ROOT.length - 1)
    .lastIndexOf(dirname);
  if (!packageEntry.startsWith(NODE_MODULES_PATH) || index === -1) {
    throw new Error(`Unexpected '${packageName}' entry '${packageEntry}'.`);
  }
  const packageDirectory = packageEntry.slice(
    0,
    PROJECT_ROOT.length + dirname.length + index - 1,
  );

  const resolved = path.join(packageDirectory, file.slice(packageName.length));

  if (!fs.existsSync(resolved)) {
    throw new Error(`'${file}' not exist.`);
  }

  return resolved;
}

export { getPackageFile };
