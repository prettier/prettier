// `typescript` is the only parser supports `assertions`
// Remove it from "check-parsers.js" when we drop support for "import assertions"
runFormatTest(import.meta, ["typescript"], {
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
  },
});
