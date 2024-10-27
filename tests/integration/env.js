"use strict";

const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
// [prettierx]
const { PRETTIERX_DIR } = process.env;
// [prettierx] get fork package name from package.json
const { bin, name } = require(path.join(PRETTIERX_DIR, "package.json"));
const prettierCli = path.join(
  PRETTIERX_DIR,
  // [prettierx] use fork package name from package.json
  typeof bin === "object" ? bin[name] : bin
);

// [prettierx]
const thirdParty = isProduction
  ? path.join(PRETTIERX_DIR, "./third-party")
  : path.join(PRETTIERX_DIR, "./src/common/third-party");

const projectRoot = path.join(__dirname, "../..");

module.exports = {
  isProduction,
  thirdParty,
  prettierCli,
  projectRoot,
};
