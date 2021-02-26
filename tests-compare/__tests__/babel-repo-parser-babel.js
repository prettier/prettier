"use strict";

const { runCompareTest } = require("../../tests_config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/**/*",
  ignore: [
    "babel/packages/babel-parser/test/fixtures/typescript/**/*",
    "babel/packages/babel-parser/test/fixtures/flow/**/*",
  ],
  options: { parser: "babel" },
});
