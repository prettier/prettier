import fs from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { isCI } from "ci-info";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  getPrettierConfigSearchStopDirectory: () => undefined,
  isCI: () => isCI,
  writeFormattedFile,
  getTimestamp: performance.now.bind(performance),
};

export default mockable;
