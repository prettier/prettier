runFormatTest(import.meta, ["babel"], {
  errors: {
    babel: true,
    __babel_estree: true,
    acorn: true,
    espree: true,
    meriyah: true,
    oxc: true,
    "oxc-ts": true,
  },
});
