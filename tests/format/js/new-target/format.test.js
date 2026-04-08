runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: true,
    hermes: true,
  },
});
