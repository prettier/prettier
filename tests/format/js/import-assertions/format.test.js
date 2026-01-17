runFormatTest(import.meta, ["oxc", "typescript", "hermes"], {
  errors: {
    "babel-ts": [
      "empty.js",
      "multi-types.js",
      "static-import.js",
      "re-export.js",
      "without-from.js",
      "non-type.js",
      "keyword-detect.js",
    ],
    hermes: ["keyword-detect.js", "empty.js", "re-export.js"],
  },
});
