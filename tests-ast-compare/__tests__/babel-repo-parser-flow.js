"use strict";

const { runAstCompareTest } = require("../../tests_config/ast-compare-test");

runAstCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/flow/**/*",
  options: { parser: "flow" },
});
