"use strict";

const path = require("path");
const installPrettier = require("../scripts/install-prettier");

const PROJECT_ROOT = path.join(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const TEST_STANDALONE = Boolean(process.env.TEST_STANDALONE);
const INSTALL_PACKAGE = Boolean(process.env.INSTALL_PACKAGE);

let PRETTIER_DIR = isProduction
  ? path.join(PROJECT_ROOT, "dist")
  : PROJECT_ROOT;
if (INSTALL_PACKAGE || (isProduction && !TEST_STANDALONE)) {
  PRETTIER_DIR = installPrettier(PRETTIER_DIR);
}
process.env.PRETTIER_DIR = PRETTIER_DIR;

Object.defineProperty(global, "run_spec", {
  get() {
    return require("./run_spec.js");
  },
});
