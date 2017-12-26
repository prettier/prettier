"use strict";

const globby = require("globby");
const path = require("path");

module.exports = globby.sync("language-*/parser-*", {
  cwd: path.join(__dirname, "../../src")
});
