import fs from "node:fs/promises";
import { isCI } from "ci-info";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  getPrettierConfigSearchStopDirectory: () => undefined,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
