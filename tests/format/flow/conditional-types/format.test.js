runFormatTest(import.meta, ["flow", "typescript"], {
  errors: {
    "babel-flow": [
      "comments-in-type-annotation.js",
      "conditional-types.js",
      "cursor.js",
      "infer-type.js",
      "nested-in-condition.js",
      "new-ternary-spec.js",
      "parentheses.js",
    ],
  },
});
