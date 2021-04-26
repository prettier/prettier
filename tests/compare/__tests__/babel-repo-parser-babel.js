"use strict";

const { runCompareTest } = require("../../tests_config/compare-test");

runCompareTest({
  patterns: "babel/packages/babel-parser/test/fixtures/**/*",
  ignore: [
    "babel/packages/babel-parser/test/fixtures/typescript/**/*",
    "babel/packages/babel-parser/test/fixtures/flow/**/*",
  ],
  options: { parser: "babel" },
  // TODO: Fix these tests
  skip: [
    "babel/packages/babel-parser/test/fixtures/core/categorized/invalid-assignment-pattern-1/input.js",
    "babel/packages/babel-parser/test/fixtures/core/create-parenthesized-expressions/invalid-parenthesized-assignment-pattern-5/input.js",
    "babel/packages/babel-parser/test/fixtures/core/uncategorised/35/input.js",
    "babel/packages/babel-parser/test/fixtures/core/uncategorised/42/input.js",
    "babel/packages/babel-parser/test/fixtures/es2015/generators/invalid-escape-yield/input.js",
    "babel/packages/babel-parser/test/fixtures/es2015/uncategorised/54/input.js",
    "babel/packages/babel-parser/test/fixtures/es2017/async-functions/async-await-as-arrow-binding-identifier/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/es2015-method-definition/migrated_0002/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/expression-primary-object/migrated_0015/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/expression-primary-object/migrated_0022/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/invalid-syntax/migrated_0037/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/invalid-syntax/migrated_0049/input.js",
    "babel/packages/babel-parser/test/fixtures/esprima/invalid-syntax/migrated_0051/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/decorators-2/nested-method-decorator/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/decorators-2/parenthesized/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/dynamic-import/invalid-lone-import/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/export-extensions/default-escaped/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/throw-expression/expression/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/throw-expression/comma/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/throw-expression/not-enabled/input.js",
    "babel/packages/babel-parser/test/fixtures/experimental/pipeline-operator/proposal-smart-topic-style,-generator-yield/input.js",
  ],
});
