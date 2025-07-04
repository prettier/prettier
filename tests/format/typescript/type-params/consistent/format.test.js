runFormatTest(import.meta, ["typescript", "flow"], {
  errors: {
    flow: ["template-literal-types.ts"],
    hermes: ["template-literal-types.ts"],
  },
});
