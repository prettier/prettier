// Tests taken from https://github.com/facebook/hermes/tree/83c8115/test/Parser/flow/match
runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": [
      "expression.js",
      "pattern-member.js",
      "statement-empty.js",
      "export.js",
      "format.test.js",
      "pattern-object.js",
      "statement-guards.js",
      "expression-empty.js",
      "pattern-array.js",
      "pattern-or-as.js",
      "statement-sequence-arg.js",
      "expression-guards.js",
      "pattern-core.js",
      "statement.js",
    ],
  },
});
