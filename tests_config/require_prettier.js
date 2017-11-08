"use strict";

const isProduction = process.env.NODE_ENV === "production";
const prettier = require(isProduction ? "../dist/" : "../");

module.exports = prettier;
