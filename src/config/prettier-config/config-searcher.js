import { FileSearcher } from "search-closest";
import {
  loadConfigFromPackageJson,
  loadConfigFromPackageYaml,
} from "./loaders.js";

/**
@import {SearcherOptions} from 'search-closest'

@typedef {string | {name: string, filter: SearcherOptions['filter']}} SearchTarget
*/

// Please keep this order sync with docs, docs/configuration.md

/** @type {SearchTarget[]} */
const CONFIG_FILES = [
  {
    name: "package.json",
    async filter({ path: file }) {
      try {
        return Boolean(await loadConfigFromPackageJson(file));
      } catch {
        return false;
      }
    },
  },
  {
    name: "package.yaml",
    async filter({ path: file }) {
      try {
        return Boolean(await loadConfigFromPackageYaml(file));
      } catch {
        return false;
      }
    },
  },

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

function getSearcher(stopDirectory) {
  return new FileSearcher(CONFIG_FILES, { stopDirectory });
}

export default getSearcher;
