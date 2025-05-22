import { FileSearcher } from "search-closest";
import {
  loadConfigFromPackageJson,
  loadConfigFromPackageYaml,
} from "./loaders.js";

/**
@import {SearcherOptions} from 'search-closest'
*/

const CONFIG_FILE_NAMES = [
  "package.json",
  "package.yaml",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json5",
  ".prettierrc.js",
  ".prettierrc.ts",
  ".prettierrc.mjs",
  ".prettierrc.mts",
  ".prettierrc.cjs",
  ".prettierrc.cts",
  "prettier.config.js",
  "prettier.config.ts",
  "prettier.config.mjs",
  "prettier.config.mts",
  "prettier.config.cjs",
  "prettier.config.cts",
  ".prettierrc.toml",
];

/** @type {SearcherOptions["filter"]} */
async function filter({ name, path: file }) {
  if (name === "package.json") {
    try {
      return Boolean(await loadConfigFromPackageJson(file));
    } catch {
      return false;
    }
  }

  if (name === "package.yaml") {
    try {
      return Boolean(await loadConfigFromPackageYaml(file));
    } catch {
      return false;
    }
  }

  return true;
}

function getSearcher(stopDirectory) {
  return new FileSearcher(CONFIG_FILE_NAMES, { filter, stopDirectory });
}

export default getSearcher;
