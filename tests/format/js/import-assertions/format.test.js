runFormatTest(import.meta, ["oxc", "yuku", "typescript"], {
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
    oxc: ["multi-types.js"],
    "oxc-ts": ["multi-types.js"],
  },
});
