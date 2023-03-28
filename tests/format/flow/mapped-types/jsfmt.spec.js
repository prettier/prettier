run_spec(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["comments.js", "intersection.js", "mapped-types.js"],
  },
});
