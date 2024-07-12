runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    meriyah: ["parentheses.js"],
    flow: ["parentheses.js"],
    typescript: ["parentheses.js"],
  },
});
