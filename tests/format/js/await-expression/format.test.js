runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    hermes: ["await-with-parens.js"],
    meriyah: ["await-with-parens.js"],
    espree: ["await-with-parens.js"],
  },
});
