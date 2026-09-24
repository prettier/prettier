runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    flow: true,
    typescript: true,
    acorn: true,
    espree: true,
    meriyah: true,
    oxc: true,
    yuku: true,
    "oxc-ts": true,
    "yuku-ts": true,
    hermes: true,
  },
});
