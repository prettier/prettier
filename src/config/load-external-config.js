import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { importFromFile } from "./import-from.js";

async function loadExternalConfig(config, filepath) {
  /*
  Try `require()` first, this is how it works in Prettier v2.
  Kept this because the external config path or package may can't load with `import()`:
  1. is JSON file or package
  2. is CommonJS file without extension
  3. is a dirname with index.js inside
  */
  try {
    return createRequire(filepath)(config);
  } catch (error) {
    if (
      error?.code !== "MODULE_NOT_FOUND" &&
      error?.code !== "ERR_REQUIRE_ESM"
    ) {
      throw error;
    }
  }

  /*
  Try local file first

  ```json
  {
    "prettier": "path/to/config/file"
  }
  ```
  */
  try {
    const module = await import(new URL(config, pathToFileURL(filepath)));
    return module.default;
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }

  /*
  Try resolve

  ```json
  {
    "prettier": "my-prettier-config-package"
  }
  ```
  */
  const module = await importFromFile(config, filepath);
  return module.default;
}

export default loadExternalConfig;
