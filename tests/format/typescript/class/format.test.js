runFormatTest(import.meta, ["typescript"], {
  errors: {
    "oxc-ts": ["declare-readonly-field-initializer-w-annotation.ts"],
  },
});
