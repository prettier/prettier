runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: true,
    espree: true,
    flow: [],
    hermes: [
      "classes.js",
      "redux.js",
      "mixed.js",
      "comments.js",
      "export-comments.js",
    ],
  },
});
