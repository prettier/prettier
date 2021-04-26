"use strict";

const { runCompareTest } = require("../../config/compare-test");

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
  // TODO: Fix these tests
  skip: [
    "babel/packages/babel-parser/test/fixtures/core/categorized/invalid-assignment-pattern-1/input.js",
    "babel/packages/babel-parser/test/fixtures/core/create-parenthesized-expressions/invalid-parenthesized-assignment-pattern-5/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/invalid-syntax/migrated_0271/input.js",
  ],
});
