run_spec(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["passing.js", "comments-in-type-annotations.js"],
  },
});
