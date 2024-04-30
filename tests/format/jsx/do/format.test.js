runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: ["do.js"],
    espree: ["do.js"],
    meriyah: ["do.js"],
  },
});
