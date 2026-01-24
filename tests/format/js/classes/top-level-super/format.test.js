runFormatTest(import.meta, ["babel", "typescript"], {
  errors: { acorn: true, espree: true, meriyah: true },
});
