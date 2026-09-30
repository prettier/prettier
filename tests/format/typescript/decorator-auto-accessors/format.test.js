runFormatTest(import.meta, ["typescript"], {
  errors: {
    "babel-ts": ["decorator-auto-accessors-abstract-class.ts"],
    "oxc-ts": [
      "decorator-auto-accessors-abstract-class.ts",
      "decorator-auto-accessors-declare-class.ts",
      "decorator-auto-accessors-mixed-modifiers.ts",
    ],
  },
});
