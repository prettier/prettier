import parseToml from "@iarna/toml/parse-async.js";
import parseJson5 from "json5/lib/parse.js";
import mockable from "../common/mockable.js";
import loadExternalConfig from "./load-external-config.js";

const { cosmiconfig } = mockable;

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

const loaders = {
  async ".toml"(filePath, content) {
    try {
      return await parseToml(content);
    } catch (/** @type {any} */ error) {
      error.message = `TOML Error in ${filePath}:\n${error.message}`;
      throw error;
    }
  },
  ".json5"(filePath, content) {
    try {
      return parseJson5(content);
    } catch (/** @type {any} */ error) {
      error.message = `JSON5 Error in ${filePath}:\n${error.message}`;
      throw error;
    }
  },
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
        `but received ${typeof config} in "${filepath}"`,
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
