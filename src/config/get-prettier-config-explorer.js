import { pathToFileURL } from "node:url";
import parseToml from "@iarna/toml/parse-async.js";
import parseJson5 from "json5/lib/parse.js";
import yaml from "js-yaml";
import mockable from "../common/mockable.js";
import loadExternalConfig from "./load-external-config.js";

const { lilconfig } = mockable;

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
  const module = await import(pathToFileURL(filepath).href);
  return module.default;
}

function loadYaml(filepath, content) {
  try {
    return yaml.load(content);
  } catch (/** @type {any} */ error) {
    error.message = `YAML Error in ${filepath}:\n${error.message}`;
    throw error;
  }
}

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
  ".js": loadJs,
  ".mjs": loadJs,
  ".yaml": loadYaml,
  ".yml": loadYaml,
  noExt: loadYaml,
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
 * @return {ReturnType<import("lilconfig").lilconfig>}
 */
function getExplorer() {
  return lilconfig("prettier", {
    searchPlaces,
    loaders,
    transform,
  });
}

export default getExplorer;
