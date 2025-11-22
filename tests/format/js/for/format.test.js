runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["for-in-with-initializer.js"],
    typescript: ["for-in-with-initializer.js"],
  },
});
