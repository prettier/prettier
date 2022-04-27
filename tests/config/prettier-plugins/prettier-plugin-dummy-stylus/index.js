"use strict";

const createPlugin = require("../../utils/create-plugin.js");

module.exports = createPlugin({
  name: "stylus",
  print: (text) => text.toUpperCase(),
});
