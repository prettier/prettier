runFormatTest(import.meta, ["babel-flow"], {
  errors: {
    "babel-flow": [
      "flow-export-type.js",
      "flow-import-type.js",
      "flow-import-typeof.js",
      "flow-type-modifier.js",
    ],
  },
});
