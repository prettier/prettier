runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: true,
    typescript: true,
    hermes: true,
  },
});
