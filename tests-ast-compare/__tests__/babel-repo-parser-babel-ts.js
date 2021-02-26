"use strict";

const { runAstCompareTest } = require("../../tests_config/ast-compare-test");

runAstCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/typescript/**/*",
  options: { parser: "babel-ts" },
});
