runFormatTest(import.meta, ["babel"], {
  errors: {
    acorn: true,
    espree: true,
    meriyah: true,
    oxc: true,
    "oxc-ts": true,
  },
});
