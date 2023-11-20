import fs from "node:fs/promises";
import getStdin from "get-stdin";
import { isCI } from "ci-info";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  // eslint-disable-next-line unicorn/no-useless-undefined
  getLilconfigStopDirectory: () => undefined,
  getStdin,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
