import fs from "node:fs/promises";
import { lilconfig } from "lilconfig";
import getStdin from "get-stdin";
import { isCI } from "ci-info";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  lilconfig,
  getStdin,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
