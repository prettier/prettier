"use strict";

const { runCompareTest } = require("../../tests_config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/**/*",
  ignore: [
    "babel/packages/babel-parser/test/fixtures/typescript/**/*",
    "babel/packages/babel-parser/test/fixtures/flow/**/*",
    "babel/packages/babel-parser/test/fixtures/experimental/**/*",
    "babel/packages/babel-parser/test/fixtures/placeholders/**/*",
    "babel/packages/babel-parser/test/fixtures/v8intrinsic/**/*",
  ],
  options: { parser: "espree" },
});
