"use strict";

module.exports = {
  get yaml() {
    return require("./parser-yaml").parsers.yaml;
  },
};
