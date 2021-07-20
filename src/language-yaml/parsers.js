"use strict";

module.exports = {
  get yaml() {
    return require("./parser-yaml.js").parsers.yaml;
  },
};
