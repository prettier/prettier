import { createRequire } from "node:module";
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
    config = createRequire(filepath)(config);
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
