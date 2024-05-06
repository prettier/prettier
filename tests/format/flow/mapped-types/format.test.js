runFormatTest(import.meta, ["flow", "typescript"], {
  errors: {
    "babel-flow": ["comments.js", "mapped-types.js", "ts-compatibility.js"],
    "babel-ts": ["comments.js", "mapped-types.js"],
    typescript: ["comments.js", "mapped-types.js"],
  },
});
