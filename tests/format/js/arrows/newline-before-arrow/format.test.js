runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: ["newline-before-arrow.js"],
    espree: ["newline-before-arrow.js"],
    meriyah: ["newline-before-arrow.js"],
    oxc: ["newline-before-arrow.js"],
    "oxc-ts": ["newline-before-arrow.js"],
  },
});
