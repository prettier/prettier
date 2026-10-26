runFormatTest(import.meta, ["typescript", "flow"], {
  errors: {
    hermes: ["template-literal-types.ts"],
  },
});
