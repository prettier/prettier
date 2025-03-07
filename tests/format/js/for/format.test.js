runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: ["parentheses.js", "for-in-with-initializer.js"],
    typescript: ["parentheses.js", "for-in-with-initializer.js"],
  },
});
