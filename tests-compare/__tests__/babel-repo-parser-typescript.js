"use strict";

const { runCompareTest } = require("../../tests_config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/typescript/**/*",
  options: { parser: "typescript" },
});
