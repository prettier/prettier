"use strict";

const { runCompareTest } = require("../../config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/**/*",
  ignore: [
    "babel/packages/babel-parser/test/fixtures/typescript/**/*",
    "babel/packages/babel-parser/test/fixtures/flow/**/*",
    "babel/packages/babel-parser/test/fixtures/placeholders/**/*",
    "babel/packages/babel-parser/test/fixtures/v8intrinsic/**/*",
  ],
  options: { parser: "meriyah" },
  // TODO: Fix these tests
  skip: [
    "babel/packages/babel-parser/test/fixtures/core/escape-keyword/invalid/input.js",
    "babel/packages/babel-parser/test/fixtures/es2015/uncategorised/319/input.js",
    "babel/packages/babel-parser/test/fixtures/es2017/async-arrow/parenthesized-binding-member-expression/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/es2015-identifier/escaped_math_alef/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/es2015-identifier/escaped_math_dal_part/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/es2015-identifier/escaped_math_kaf_lam/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/es2015-identifier/escaped_math_zain_start/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/invalid-syntax/migrated_0137/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/invalid-syntax/migrated_0166/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/invalid-syntax/migrated_0167/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/class-properties/no-ctor-2/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/module-string-names/namespace-export/input.js",
    "babel/packages/babel-parser/test/fixtures/jsx/errors/unicode-escape-in-identifier/input.js",
  ],
});
