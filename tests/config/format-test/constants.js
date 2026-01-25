import path from "node:path";
import createEsmUtils from "esm-utils";
import { normalizeDirectory } from "./utilities.js";

const { __dirname } = createEsmUtils(import.meta);

export const FORMAT_TEST_DIRECTORY = normalizeDirectory(
  path.join(__dirname, "../../format/"),
);
