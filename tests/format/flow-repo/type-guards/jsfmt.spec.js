runFormatTest(import.meta, ["flow"], {
  errors: {
    "babel-flow": ["passing.js", "comments-in-type-annotations.js"],
  },
});
