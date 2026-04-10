runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: true,
    espree: true,
    flow: ["classes.js"],
    hermes: ["classes.js", "redux.js", "mixed.js", "comments.js"],
  },
});
