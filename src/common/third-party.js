"use strict";

module.exports = {
  cosmiconfig: require("cosmiconfig"),
  findParentDir: require("find-parent-dir").sync,
  getStream: require("get-stream"),
  isCI: () => require("is-ci")
};
