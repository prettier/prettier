runFormatTest(import.meta, ["babel", "typescript", "flow"], {
  errors: {
    acorn: ["expression.js"],
    espree: ["expression.js"],
    typescript: ["expression.js", "bigint-key.js"],
    meriyah: ["expression.js"],
    flow: ["expression.js"],
  },
});
