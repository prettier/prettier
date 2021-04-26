"use strict";

const { runCompareTest } = require("../../config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/typescript/**/*",
  options: { parser: "babel-ts" },
});
