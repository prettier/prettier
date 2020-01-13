"use strict";

const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const prettierRootDir = path.resolve(
  isProduction ? process.env.PRETTIER_DIR : "../"
);
const prettierPkg = require(path.join(prettierRootDir, "package.json"));
const prettierCli = path.join(prettierRootDir, prettierPkg.bin.prettier);

const thirdParty = isProduction
  ? path.join(prettierRootDir, "./third-party")
  : path.join(prettierRootDir, "./src/common/third-party");

module.exports = {
  prettierRootDir,
  thirdParty,
  prettierCli
};
