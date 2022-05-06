"use strict";

module.exports = {
  cosmiconfig: require("cosmiconfig").cosmiconfig,
  findParentDir: require("find-parent-dir").sync,
  getStdin: require("get-stdin"),
  isCI: () => require("ci-info").isCI,
};
