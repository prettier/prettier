runFormatTest(import.meta, ["typescript"], {
  errors: {
    "oxc-ts": [
      "declare-class-fields.ts",
      "declare-module.ts",
      "declare-namespace.ts",
    ],
    "babel-ts": [
      "declare-class-fields.ts",
      "declare-module.ts",
      "declare-namespace.ts",
    ],
  },
});
