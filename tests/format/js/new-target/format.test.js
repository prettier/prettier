runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    espree: true,
    flow: true,
    hermes: true,
  },
});
