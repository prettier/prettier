import path from "node:path";
import fastGlob from "fast-glob";
import { BUILD_DIR, DIST_DIR, copyFile } from "../utils/index.mjs";

/**
 * @typedef {import("./config.mjs").File} File
 */

/**
 * Copies `*.d.ts` files to `build/dts-files/*.d.ts` from `dist/types/*.d.ts`
 *
 * @returns {Promise<File[]>}
 */
async function generateDtsConfigs() {
  /** @type {File[]} */
  const configs = [];
  const dtsDir = path.join(BUILD_DIR, "dts-files");
  const dtsFilesPattern = path.join(dtsDir, "**", "*.d.ts");
  const dtsFiles = await fastGlob(dtsFilesPattern);
  for (const dtsFile of dtsFiles) {
    const relativeDtsFile = path.relative(dtsDir, dtsFile);
    const distTypesDir = path.join(DIST_DIR, "types");
    configs.push({
      output: {
        format: "text",
        file: path.join("types", relativeDtsFile),
      },
      isMetaFile: true,
      async build() {
        await copyFile(dtsFile, path.join(distTypesDir, relativeDtsFile));
      },
    });
  }
  return configs;
}

export default generateDtsConfigs;
