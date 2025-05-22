import path from "node:path";
import createEsmUtils from "esm-utils";

const { __dirname, require } = createEsmUtils(import.meta);

const isProduction = process.env.NODE_ENV === "production";
const { PRETTIER_DIR } = process.env;
const { bin } = require(path.join(PRETTIER_DIR, "package.json"));
const prettierCliEntry = path.join(
  PRETTIER_DIR,
  typeof bin === "object" ? bin.prettier : bin,
);

const prettierMainEntry = isProduction
  ? path.join(PRETTIER_DIR, "./index.mjs")
  : path.join(PRETTIER_DIR, "./src/index.js");

const projectRoot = path.join(__dirname, "../..");

const prettierCliMockableEntry = isProduction
  ? path.join(PRETTIER_DIR, "./internal/legacy-cli.mjs")
  : path.join(PRETTIER_DIR, "./src/cli/index.js");

export {
  isProduction,
  prettierCliEntry,
  prettierCliMockableEntry,
  prettierMainEntry,
  projectRoot,
};
