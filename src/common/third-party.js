"use strict";

module.exports = {
  cosmiconfig: require("cosmiconfig").cosmiconfig,
  cosmiconfigSync: require("cosmiconfig").cosmiconfigSync,
  findParentDir: require("find-parent-dir").sync,
  getStdin: require("get-stdin"),
  isCI: () => require("ci-info").isCI,
};
