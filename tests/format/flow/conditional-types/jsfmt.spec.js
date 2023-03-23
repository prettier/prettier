run_spec(import.meta, ["flow", "typescript"], {
  errors: {
    "babel-flow": [
      "comments.js",
      "conditional-types.js",
      "infer-type.js",
      "nested-in-condition.js",
      "new-ternary-spec.js",
      "parentheses.js",
    ],
  },
});
