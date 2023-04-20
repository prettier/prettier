import fs from "node:fs/promises";
import { cosmiconfig } from "cosmiconfig";
import { sync as findParentDir } from "find-parent-dir";
import getStdin from "get-stdin";
import { isCI } from "ci-info";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  cosmiconfig,
  findParentDir,
  getStdin,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
