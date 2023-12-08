import requireFromFile from "../../utils/require-from-file.js";
import importFromFile from "../../utils/import-from-file.js";

const requireErrorCodesShouldBeIgnored = new Set([
  "MODULE_NOT_FOUND",
  "ERR_REQUIRE_ESM",
  "ERR_PACKAGE_PATH_NOT_EXPORTED",
]);
async function loadExternalConfig(externalConfig, configFile) {
  /*
  Try `require()` first, this is how it works in Prettier v2.
  Kept this because the external config path or package may can't load with `import()`:
  1. is JSON file or package
  2. is CommonJS file without extension
  3. is a dirname with index.js inside
  */
  try {
    return requireFromFile(externalConfig, configFile);
  } catch (/** @type {any} */ error) {
    if (!requireErrorCodesShouldBeIgnored.has(error?.code)) {
      throw error;
    }
  }

  const module = await importFromFile(externalConfig, configFile);
  return module.default;
}

export default loadExternalConfig;
