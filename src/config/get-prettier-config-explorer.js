import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import loadToml from "../utils/load-toml.js";
import loadJson5 from "../utils/load-json5.js";
import thirdParty from "../common/third-party.js";

const { cosmiconfig } = thirdParty;

const searchPlaces = [
  "package.json",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json5",
  ".prettierrc.js",
  ".prettierrc.mjs",
  ".prettierrc.cjs",
  "prettier.config.js",
  "prettier.config.mjs",
  "prettier.config.cjs",
  ".prettierrc.toml",
];

async function importModuleDefault(url) {
  const module = await import(url);
  return module.default;
}

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
    if (error?.code !== "MODULE_NOT_FOUND") {
      throw error;
    }
  }

  const directory = path.dirname(filepath);

  try {
    return await importModuleDefault(
      new URL(config, pathToFileURL(directory + "/"))
    );
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }

  return importModuleDefault(config);
}

function jsConfigLoader(filepath /*, content*/) {
  return importModuleDefault(pathToFileURL(filepath));
}

const loaders = {
  ".toml": loadToml,
  ".json5": loadJson5,
  ".js": jsConfigLoader,
  ".mjs": jsConfigLoader,
  ".cjs": jsConfigLoader,
};

async function transform(result) {
  if (!result?.config) {
    return result;
  }

  let { config, filepath } = result;

  if (typeof config === "string") {
    config = await loadExternalConfig(config, filepath);
    result.config = config;
  }

  if (typeof config !== "object") {
    throw new TypeError(
      "Config is only allowed to be an object, " +
        `but received ${typeof config} in "${filepath}"`
    );
  }

  delete config.$schema;
  return result;
}

/**
 * @param {{cache: boolean }} options
 * @return {ReturnType<import("cosmiconfig").cosmiconfig>}
 */
function getExplorer(options) {
  return cosmiconfig("prettier", {
    cache: options.cache,
    transform,
    searchPlaces,
    loaders,
  });
}

export default getExplorer;
