"use strict";

const createPlugin = require("../../utils/create-plugin.cjs");

module.exports = createPlugin({
  name: "uppercase-rocks",
  print: (text) => text.toUpperCase(),
});
