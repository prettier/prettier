import { pathToFileURL } from "node:url";
import loadToml from "../utils/load-toml.js";
import loadJson5 from "../utils/load-json5.js";
import thirdParty from "../common/third-party.js";
import loadExternalConfig from "./load-external-config.js";

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

async function loadJs(filepath /*, content*/) {
  const { default: config } = await import(pathToFileURL(filepath));
  return config;
}

const loaders = {
  ".toml": loadToml,
  ".json5": loadJson5,
  ".js": loadJs,
  ".mjs": loadJs,
  ".cjs": loadJs,
};

async function transform(result) {
  if (!result?.config) {
    return result;
  }

  let { config, filepath } = result;

  /*
  We support external config

  ```json
  {
    "prettier": "my-prettier-config-package-or-file"
  }
  ```
  */
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
