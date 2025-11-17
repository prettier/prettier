runFormatTest(import.meta, ["babel", "babel-ts"], {
  errors: {
    acorn: true,
    espree: true,
    meriyah: true,
    oxc: true,
    "oxc-ts": true,
  },
});
