import { FileSearcher } from "search-closest";
import {
  loadConfigFromPackageJson,
  loadConfigFromPackageYaml,
} from "./loaders.js";

/**
@import {SearcherOptions} from 'search-closest'
*/

// Align with docs, docs/configuration.md
const CONFIG_FILE_NAMES = [
  "package.json",
  "package.yaml",

  ".prettierrc",

  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
  ".prettierrc.json5",

  ".prettierrc.js",
  "prettier.config.js",
  ".prettierrc.ts",
  "prettier.config.ts",

  ".prettierrc.mjs",
  "prettier.config.mjs",
  ".prettierrc.mts",
  "prettier.config.mts",

  ".prettierrc.cjs",
  "prettier.config.cjs",
  ".prettierrc.cts",
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
