"use strict";

const isProduction = process.env.NODE_ENV === "production";
const prettierRootDir = isProduction ? process.env.PRETTIERX_DIR : "../";

const prettierx = require(prettierRootDir);

module.exports = prettierx;
