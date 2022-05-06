import path from "node:path";
import createEsmUtils from "esm-utils";

const { __dirname, require } = createEsmUtils(import.meta);

const isProduction = process.env.NODE_ENV === "production";
const { PRETTIER_DIR } = process.env;
const { bin } = require(path.join(PRETTIER_DIR, "package.json"));
const prettierCli = path.join(
  PRETTIER_DIR,
  typeof bin === "object" ? bin.prettier : bin
);

const thirdParty = isProduction
  ? path.join(PRETTIER_DIR, "./third-party")
  : path.join(PRETTIER_DIR, "./src/common/third-party");

const projectRoot = path.join(__dirname, "../..");

export { isProduction, thirdParty, prettierCli, projectRoot };
