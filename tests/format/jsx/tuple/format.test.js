runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: ["tuple.js"],
    espree: ["tuple.js"],
    meriyah: ["tuple.js"],
  },
});
