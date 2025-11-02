runFormatTest(import.meta, ["babel", "flow"], {
  errors: {
    acorn: true,
    espree: true,
    meriyah: true,
    flow: true,
    hermes: true,
    oxc: true,
    "oxc-ts": true,
  },
});
