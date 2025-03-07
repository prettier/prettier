runFormatTest(import.meta, ["flow"], {
  trailingComma: "all",
  errors: {
    "babel-flow": ["enum-bigint-explicit.js", "enum-bigint-implicit.js"],
  },
});
