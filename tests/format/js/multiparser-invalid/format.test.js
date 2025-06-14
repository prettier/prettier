runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: true,
    espree: true,
    flow: true,
    hermes: true,
    typescript: true,
    meriyah: true,
    oxc: true,
    "oxc-ts": true,
  },
});
