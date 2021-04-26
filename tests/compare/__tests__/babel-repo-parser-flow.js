"use strict";

const { runCompareTest } = require("../../tests_config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/flow/**/*",
  options: { parser: "flow" },
  // TODO: Fix these tests
  skip: [
    "babel/packages/babel-parser/test/fixtures/flow/declare-statements/11/input.js",
  ],
});
