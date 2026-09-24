runFormatTest(import.meta, ["typescript", "flow"], {
  trailingComma: "es5",
  errors: { "oxc-ts": ["module.ts"], "babel-ts": ["module.ts"] },
});
