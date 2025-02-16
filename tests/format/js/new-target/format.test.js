runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: true,
    espree: true,
    meriyah: true,
    oxc: true,
    flow: true,
  },
});
