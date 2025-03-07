runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: true,
    espree: true,
    meriyah: true,
    flow: true,
  },
});
