import fs from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { isCI } from "ci-info";
// @ts-expect-error
import { __internal as sharedWithCli } from "../index.js";
import clearStreamText from "./utilities/clear-stream-text.js";

const mockable = sharedWithCli.utils.createMockable({
  clearStreamText,
  getTimestamp: performance.now.bind(performance),
  isCI: () => isCI,
  isStreamTTY: (stream) => stream.isTTY,
  writeFormattedFile: (file, data) => fs.writeFile(file, data),
});

export default mockable.mocked;
export { mockable };
