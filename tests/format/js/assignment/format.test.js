runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    hermes: ["binaryish.js"],
  },
});
