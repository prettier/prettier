import fs from "node:fs/promises";

import { isCI } from "ci-info";
import getStdin from "get-stdin";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  // eslint-disable-next-line unicorn/no-useless-undefined
  getPrettierConfigSearchStopDirectory: () => undefined,
  getStdin,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
