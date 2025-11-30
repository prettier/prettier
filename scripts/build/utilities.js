import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { resolve } from "import-meta-resolve";
import { isUrl, toUrl } from "url-or-path";
import { PROJECT_ROOT } from "../utilities/index.js";

const NODE_MODULES_PATH = path.join(PROJECT_ROOT, "node_modules");

/**
Get a package file.

@param {string} file - package file to get
  - a package name like `"prettier"`
  - a package name with path like `"prettier/index.js"`
@param {string} [base] -- Where the package should be solved from
  - a package name like `"prettier"`
  - a file url like `"file://path/to/prettier"`
  - an absolute path like `"/path/to/prettier"`
@returns {string}
*/
function getPackageFile(file, base) {
  const packageName = file
    .split("/")
    .slice(0, file.startsWith("@") ? 2 : 1)
    .join("/");

  base ??= path.join(NODE_MODULES_PATH, packageName);
  if (!path.isAbsolute(base) && !isUrl(base)) {
    base = getPackageFile(base);
  }

  const packageEntry = url.fileURLToPath(resolve(packageName, toUrl(base)));

  const dirname = `/node_modules/${packageName}/`.replaceAll("/", path.sep);
  const index = packageEntry
    .slice(PROJECT_ROOT.length - 1)
    .lastIndexOf(dirname);
  if (!packageEntry.startsWith(NODE_MODULES_PATH) || index === -1) {
    throw new Error(`Unexpected '${packageName}' entry '${packageEntry}'.`);
  }

  let resolved;
  if (packageName === file) {
    resolved = packageEntry;
  } else {
    const packageDirectory = packageEntry.slice(
      0,
      PROJECT_ROOT.length + dirname.length + index - 1,
    );
    resolved = path.join(packageDirectory, file.slice(packageName.length));
  }

  if (!fs.existsSync(resolved)) {
    throw new Error(`'${file}' not exist.`);
  }

  return resolved;
}

export { getPackageFile };
