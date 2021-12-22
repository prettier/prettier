"use strict";

const createPlugin = require("../../utils/create-plugin.js");

module.exports = createPlugin({
  name: "uppercase-rocks",
  print: (text) => text.toUpperCase(),
});
