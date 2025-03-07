import fs from "node:fs/promises";
import { isCI } from "ci-info";
import getStdin from "get-stdin";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  getPrettierConfigSearchStopDirectory: () => undefined,
  getStdin,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
