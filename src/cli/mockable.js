import fs from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { isCI } from "ci-info";
// @ts-expect-error
import { __internal as sharedWithCli } from "../index.js";
import clearStreamText from "./utilities/clear-stream-text.js";

/**
 * @param {string} file
 * @param {string} data
 */
async function writeFormattedFile(file, data) {
  const maxRetries = 5;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fs.writeFile(file, data);
    } catch (error) {
      const fsError = /** @type {NodeJS.ErrnoException} */ (error);
      // libuv reports Windows' ERROR_USER_MAPPED_FILE as UNKNOWN when opening
      // a file for truncation while another process has a mapped view open.
      if (
        process.platform !== "win32" ||
        fsError?.code !== "UNKNOWN" ||
        fsError.syscall !== "open" ||
        attempt === maxRetries
      ) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
    }
  }
}

const mockable = sharedWithCli.utilities.createMockable({
  clearStreamText,
  getTimestamp: performance.now.bind(performance),
  isCI: () => isCI,
  isStreamTTY: (stream) => stream.isTTY,
  writeFormattedFile,
});

export default mockable.mocked;
export { mockable };
