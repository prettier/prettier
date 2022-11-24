"use strict";

const createPlugin = require("../../utils/create-plugin.js");

const COMMENT = "/* Formatted by stylus plugin */";

module.exports = createPlugin({
  name: "stylus",
  print: (text) => COMMENT + "\n" + text.replace(COMMENT, "").trim(),
});
