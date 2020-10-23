run_spec(__dirname, ["flow", "babel-flow"], {
  trailingComma: "all",
  errors: {
    "babel-flow": ["function_type.js", "line_break.js", "union_type.js"],
  },
});
