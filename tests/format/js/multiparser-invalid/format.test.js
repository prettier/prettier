runFormatTest(import.meta, ["babel", "flow", "typescript"], {
  errors: {
    acorn: true,
    espree: true,
    flow: true,
    typescript: true,
    meriyah: true,
  },
});
