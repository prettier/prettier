runFormatTest(import.meta, ["flow", "typescript"], {
  errors: {
    "babel-ts": ["comments.js", "mapped-types.js"],
    typescript: ["comments.js", "mapped-types.js"],
    "oxc-ts": ["comments.js", "mapped-types.js"],
  },
});
