runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    hermes: ["destructuring.js"],
  },
});
