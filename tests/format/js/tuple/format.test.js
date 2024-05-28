runFormatTest(import.meta, ["babel"], {
  errors: {
    babel: ["invalid-tuple-holes.js"],
    __babel_estree: ["invalid-tuple-holes.js"],
    acorn: true,
    espree: true,
    meriyah: true,
  },
});
