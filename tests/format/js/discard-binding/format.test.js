runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: true,
    typescript: true,
    acorn: true,
    espree: true,
    meriyah: true,
    oxc: true,
    "oxc-ts": true,
    hermes: true,
  },
});
