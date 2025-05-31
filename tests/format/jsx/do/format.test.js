runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: ["do.js"],
    espree: ["do.js"],
    meriyah: ["do.js"],
    oxc: ["do.js"],
    "oxc-ts": ["do.js"],
  },
});
