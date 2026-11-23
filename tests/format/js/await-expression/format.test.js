runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    meriyah: ["await-with-parens.js"],
    espree: ["await-with-parens.js"],
  },
});
