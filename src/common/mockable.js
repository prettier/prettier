import fs from "node:fs/promises";
import path from "node:path";
import { lilconfig } from "lilconfig";
import getStdin from "get-stdin";
import { isCI } from "ci-info";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  // TODO[@fisker]: Mock `findProjectRoot` instead.
  lilconfig(moduleName, lilconfigOptions = {}) {
    const { stopDir } = lilconfigOptions;

    // Bug in lilconfig
    // `getSearchPaths('/a/b', '/a/b/')` in that package searches up to root.
    if (stopDir) {
      lilconfigOptions.stopDir = path.resolve(stopDir);
    }

    // Note: lilconfig also set `stopDir` default to `os.homedir`, but it won't
    // stop when searching in other places.

    return lilconfig(moduleName, lilconfigOptions);
  },
  getStdin,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
