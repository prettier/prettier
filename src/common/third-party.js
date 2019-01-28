"use strict";

const cosmiconfig = require("cosmiconfig");
const findParentDir = require("find-parent-dir").sync;
const getStream = require("get-stream");
const isCIValue = require("is-ci");

module.exports = {
  cosmiconfig,
  findParentDir,
  getStream,
  isCI: /* istanbul ignore next */ () => isCIValue
};
