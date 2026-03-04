runFormatTest(import.meta, ["typescript"], {
  errors: {
    "oxc-ts": [
      "declare_class_fields.ts",
      "declare_module.ts",
      "declare_namespace.ts",
    ],
  },
});
