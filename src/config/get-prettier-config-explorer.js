import { createRequire } from "node:module";
import path from "node:path";
import loadToml from "../utils/load-toml.js";
import loadJson5 from "../utils/load-json5.js";
import resolve from "../common/resolve.js";
import thirdParty from "../common/third-party.js";

const require = createRequire(import.meta.url);
const { cosmiconfig } = thirdParty;

const searchPlaces = [
  "package.json",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json5",
  ".prettierrc.js",
  ".prettierrc.cjs",
  "prettier.config.js",
  "prettier.config.cjs",
  ".prettierrc.toml",
];

const loaders = { ".toml": loadToml, ".json5": loadJson5 };

function transform(result) {
  if (!result?.config) {
    return result;
  }

  let { config, filepath } = result;

  if (typeof config === "string") {
    const directory = path.dirname(filepath);
    const modulePath = resolve(config, { paths: [directory] });
    config = require(modulePath);
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
