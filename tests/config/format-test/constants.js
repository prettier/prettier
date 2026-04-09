import path from "node:path";
import createEsmUtils from "esm-utils";
import { normalizeDirectory } from "./utilities.js";

const { __dirname } = createEsmUtils(import.meta);

export const FORMAT_SCRIPT_FILENAME = "format.test.js";

export const FORMAT_TEST_DIRECTORY = normalizeDirectory(
  path.join(__dirname, "../../format/"),
);

export const { FULL_TEST, TEST_STANDALONE, NODE_ENV, TEST_RUNTIME } =
  process.env;
export const isProduction = NODE_ENV === "production";
export const BOM = "\uFEFF";

export const CURSOR_PLACEHOLDER = "<|>";
export const RANGE_START_PLACEHOLDER = "<<<PRETTIER_RANGE_START>>>";
export const RANGE_END_PLACEHOLDER = "<<<PRETTIER_RANGE_END>>>";
