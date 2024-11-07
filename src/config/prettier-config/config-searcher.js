import isFile from "../../utils/is-file.js";
import Searcher from "../searcher.js";
import {
  loadConfigFromPackageJson,
  loadConfigFromPackageYaml,
} from "./loaders.js";

const CONFIG_FILE_NAMES = [
  "package.json",
  "package.yaml",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json5",
  ".prettierrc.js",
  ".prettierrc.mjs",
  ".prettierrc.cjs",
  ".prettierrc.ts",
  ".prettierrc.mts",
  ".prettierrc.cts",
  "prettier.config.js",
  "prettier.config.mjs",
  "prettier.config.cjs",
  "prettier.config.ts",
  "prettier.config.mts",
  "prettier.config.cts",
  ".prettierrc.toml",
];

async function filter({ name, path: file }) {
  if (!(await isFile(file))) {
    return false;
  }

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
  return new Searcher({ names: CONFIG_FILE_NAMES, filter, stopDirectory });
}

export default getSearcher;
