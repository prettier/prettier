"use strict";

const { runCompareTest } = require("../../tests_config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/flow/**/*",
  options: { parser: "babel-flow" },
  // TODO: Fix these tests
  skip: [
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_01/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_02/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_05/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_06/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_07/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_08/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_09/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_10/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_11/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/anonymous-function-no-parens-types/good_12/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/declare-statements/11/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/optional-type/4/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/regression/issue-58/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/this-annotation/this-arrow-function/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/type-annotations/with-default-invalid/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/type-generics/async-arrow-like/input.js",
    "babel/packages/babel-parser/test/fixtures/flow/type-generics/async-arrow-rest-optional-parameters/input.js",
  ],
});
