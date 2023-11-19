import fs from "node:fs/promises";
import getStdin from "get-stdin";
import { isCI } from "ci-info";
import {
  searchConfig as searchPrettierConfig,
  loadConfig as loadPrettierConfig,
  clearCache as clearPrettierConfigCache,
} from "../config/prettier-config-explorer/index.js";

function writeFormattedFile(file, data) {
  return fs.writeFile(file, data);
}

const mockable = {
  searchPrettierConfig,
  loadPrettierConfig,
  clearPrettierConfigCache,
  getStdin,
  isCI: () => isCI,
  writeFormattedFile,
};

export default mockable;
